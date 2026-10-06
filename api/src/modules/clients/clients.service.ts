import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export class ClientsService {
  static async listClients(trainerUserId: string, query: any) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    if (!trainer) throw { status: 403, message: 'Only trainers can list clients' };

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || query.limit || '20', 10)));
    const skip = (page - 1) * pageSize;

    const where: any = { trainerId: trainer.id };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status === 'ARCHIVED' ? 'INACTIVE' : query.status;
    } else if (!query.status) {
      // Default: active / non-archived clients
      where.status = 'ACTIVE';
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }

    let orderBy: any = { joiningDate: 'desc' };
    if (query.sortBy) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      if (query.sortBy === 'name' || query.sortBy === 'fullName') {
        orderBy = { fullName: sortOrder };
      } else if (query.sortBy === 'createdAt' || query.sortBy === 'joiningDate') {
        orderBy = { joiningDate: sortOrder };
      } else if (query.sortBy === 'status') {
        orderBy = { status: sortOrder };
      }
    }

    const [rawClients, totalItems] = await Promise.all([
      prisma.clientProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: { select: { email: true } },
          goals: { where: { status: 'ACTIVE' }, select: { id: true } },
          attendanceRecords: { select: { status: true } },
          progressLogs: { orderBy: { date: 'desc' }, take: 1, select: { createdAt: true, date: true } }
        }
      }),
      prisma.clientProfile.count({ where })
    ]);

    const items = rawClients.map(c => {
      const totalAtt = c.attendanceRecords.length;
      const presentAtt = c.attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;
      const lastActivityAt = c.progressLogs[0]?.date || c.joiningDate;

      return {
        id: c.id,
        userId: c.userId,
        fullName: c.fullName,
        email: c.user?.email || null,
        phone: c.phone || null,
        status: c.status,
        age: c.age,
        fitnessLevel: c.fitnessLevel,
        targetWeightKg: c.targetWeightKg ? Number(c.targetWeightKg) : null,
        joiningDate: c.joiningDate,
        stats: {
          attendanceRate,
          activeGoals: c.goals.length,
          lastActivityAt
        }
      };
    });

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      },
      // Backwards compatibility for existing consumers
      data: items,
      meta: {
        total: totalItems,
        page,
        limit: pageSize,
        totalPages
      }
    };
  }

  static async createClient(trainerUserId: string, data: any) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    if (!trainer) throw { status: 403, message: 'Only trainers can add clients' };

    const normalizedEmail = data.email.trim().toLowerCase();

    return prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: normalizedEmail }, include: { clientProfile: true } });

      if (user) {
        if (user.role !== Role.CLIENT) {
          throw { status: 400, message: 'An account with this email already exists and is not a client account.' };
        }
        if (user.clientProfile) {
          if (user.clientProfile.trainerId === trainer.id) {
            throw { status: 409, message: 'This client is already assigned to you.' };
          }
          // Associate existing client
          const updated = await tx.clientProfile.update({
            where: { id: user.clientProfile.id },
            data: { trainerId: trainer.id, status: 'ACTIVE' }
          });
          return updated;
        }
        
        // Edge case: User has CLIENT role but no profile yet
        const profile = await tx.clientProfile.create({
          data: {
            userId: user.id,
            fullName: data.fullName,
            trainerId: trainer.id,
            phone: data.phone || null,
            age: data.age || null,
            heightCm: data.heightCm || null,
            currentWeightKg: data.currentWeightKg || null,
            targetWeightKg: data.targetWeightKg || null,
            startingWeightKg: data.currentWeightKg || null,
            fitnessLevel: data.fitnessLevel || 'BEGINNER',
            primaryGoal: data.primaryGoal || null,
            status: 'ACTIVE'
          }
        });
        return profile;
      }

      // Create new user with CLIENT role
      const rawPassword = data.password || Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(rawPassword, 10);
      
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: Role.CLIENT,
          isEmailVerified: true,
          clientProfile: {
            create: {
              fullName: data.fullName,
              trainerId: trainer.id,
              phone: data.phone || null,
              age: data.age || null,
              heightCm: data.heightCm || null,
              currentWeightKg: data.currentWeightKg || null,
              targetWeightKg: data.targetWeightKg || null,
              startingWeightKg: data.currentWeightKg || null,
              fitnessLevel: data.fitnessLevel || 'BEGINNER',
              primaryGoal: data.primaryGoal || null,
              status: 'ACTIVE'
            }
          }
        },
        include: { clientProfile: true }
      });

      const clientProfile = newUser.clientProfile!;

      // Optional initial goal creation if primaryGoal specified
      if (data.primaryGoal) {
        await tx.fitnessGoal.create({
          data: {
            clientId: clientProfile.id,
            type: 'OTHER',
            title: data.primaryGoal,
            targetValue: data.targetWeightKg || null,
            unit: data.targetWeightKg ? 'kg' : null,
            status: 'ACTIVE'
          }
        });
      }

      // Optional initial trainer private note
      if (data.initialNotes && data.initialNotes.trim()) {
        await tx.trainerPrivateNote.create({
          data: {
            trainerId: trainer.id,
            clientId: clientProfile.id,
            content: data.initialNotes.trim(),
            category: 'GENERAL'
          }
        });
      }

      // Optional baseline weight measurement
      if (data.currentWeightKg) {
        await tx.bodyMeasurement.create({
          data: {
            clientId: clientProfile.id,
            weightKg: data.currentWeightKg,
            heightCm: data.heightCm || null
          } as any
        });
      }

      return clientProfile;
    });
  }

  static async findExistingClient(trainerUserId: string, identifier: string) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    if (!trainer) throw { status: 403, message: 'Only trainers can search clients' };

    const term = identifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        role: Role.CLIENT,
        OR: [
          { email: { equals: term, mode: 'insensitive' } },
          { clientProfile: { phone: { equals: term } } }
        ]
      },
      include: {
        clientProfile: true
      }
    });

    if (!user || !user.clientProfile) {
      throw { status: 404, message: 'No registered client account found matching that email or phone number.' };
    }

    const isAlreadyAssigned = user.clientProfile.trainerId === trainer.id && user.clientProfile.status === 'ACTIVE';

    return {
      id: user.clientProfile.id,
      userId: user.id,
      fullName: user.clientProfile.fullName,
      email: user.email,
      phone: user.clientProfile.phone,
      fitnessLevel: user.clientProfile.fitnessLevel,
      currentTrainerId: user.clientProfile.trainerId,
      isAlreadyAssigned
    };
  }

  static async associateExistingClient(trainerUserId: string, data: { email?: string; phone?: string; clientId?: string }) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    if (!trainer) throw { status: 403, message: 'Only trainers can associate clients' };

    let clientProfile: any = null;

    if (data.clientId) {
      clientProfile = await prisma.clientProfile.findUnique({
        where: { id: data.clientId },
        include: { user: true }
      });
    } else if (data.email) {
      const user = await prisma.user.findUnique({
        where: { email: data.email.trim().toLowerCase() },
        include: { clientProfile: true }
      });
      if (user && user.role === Role.CLIENT && user.clientProfile) {
        clientProfile = user.clientProfile;
      }
    } else if (data.phone) {
      clientProfile = await prisma.clientProfile.findFirst({
        where: { phone: data.phone.trim() },
        include: { user: true }
      });
    }

    if (!clientProfile) {
      throw { status: 404, message: 'Client account not found' };
    }

    if (clientProfile.trainerId === trainer.id && clientProfile.status === 'ACTIVE') {
      throw { status: 409, message: 'This client is already assigned to you.' };
    }

    const updated = await prisma.clientProfile.update({
      where: { id: clientProfile.id },
      data: {
        trainerId: trainer.id,
        status: 'ACTIVE'
      }
    });

    return updated;
  }

  static async getClient(trainerUserId: string, clientId: string) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: { user: { select: { email: true } } }
    });

    if (!client) throw { status: 404, message: 'Client not found' };
    
    // Authorization: trainer can only view their own clients.
    if (trainer && client.trainerId !== trainer.id) {
       throw { status: 403, message: 'Unauthorized access to client' };
    }
    // Alternatively, if requested by the client themselves
    if (!trainer && client.userId !== trainerUserId) {
       throw { status: 403, message: 'Unauthorized access to client' };
    }

    return client;
  }

  static async updateClient(trainerUserId: string, clientId: string, data: any) {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });
    if (!trainer) throw { status: 403, message: 'Only trainers can update clients' };

    const client = await prisma.clientProfile.findUnique({ where: { id: clientId } });
    if (!client || client.trainerId !== trainer.id) {
      throw { status: 404, message: 'Client not found or unauthorized' };
    }

    return prisma.clientProfile.update({
      where: { id: clientId },
      data
    });
  }

  static async archiveClient(trainerUserId: string, clientId: string) {
    return this.updateClient(trainerUserId, clientId, { status: 'INACTIVE' });
  }

  static async restoreClient(trainerUserId: string, clientId: string) {
    return this.updateClient(trainerUserId, clientId, { status: 'ACTIVE' });
  }

  static async addAssessment(trainerUserId: string, clientId: string, data: any) {
    await this.getClient(trainerUserId, clientId);
    return prisma.fitnessAssessment.create({
      data: {
        clientId,
        ...data,
      }
    });
  }

  static async addMeasurement(trainerUserId: string, clientId: string, data: any) {
    await this.getClient(trainerUserId, clientId);
    return prisma.bodyMeasurement.create({
      data: {
        clientId,
        ...data,
      }
    });
  }

  static async getClientSummary(trainerUserId: string, clientId: string) {
    const client = await this.getClient(trainerUserId, clientId);
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: trainerUserId } });

    const [
      assessments, 
      measurements, 
      goals, 
      workoutPlans, 
      attendanceRecords,
      trainerNotes
    ] = await Promise.all([
      prisma.fitnessAssessment.findMany({
        where: { clientId },
        orderBy: { assessedAt: 'desc' },
        take: 5,
      }),
      prisma.bodyMeasurement.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
        take: 10,
      }),
      prisma.fitnessGoal.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        include: { milestones: { orderBy: { order: 'asc' } } }
      }),
      prisma.workoutPlan.findMany({
        where: { clientId },
        orderBy: { startDate: 'desc' },
        include: { workouts: { take: 5 } }
      }),
      prisma.attendance.findMany({
        where: { clientId },
        orderBy: { markedAt: 'desc' },
        take: 50,
      }),
      trainer ? prisma.trainerPrivateNote.findMany({
        where: { clientId, trainerId: trainer.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      }) : Promise.resolve([])
    ]);

    const totalAttended = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const totalMissed = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const totalRecords = attendanceRecords.length;
    const attendanceRate = totalRecords > 0 ? Math.round((totalAttended / totalRecords) * 100) : 100;

    // Derived BMI
    let bmi: number | null = null;
    const latestWeight = measurements[0]?.weightKg || client.currentWeightKg;
    if (latestWeight && client.heightCm) {
      const heightM = Number(client.heightCm) / 100;
      bmi = Math.round((Number(latestWeight) / (heightM * heightM)) * 10) / 10;
    }

    return {
      client,
      fitness: {
        currentWeightKg: latestWeight ? Number(latestWeight) : null,
        targetWeightKg: client.targetWeightKg ? Number(client.targetWeightKg) : null,
        startingWeightKg: client.startingWeightKg ? Number(client.startingWeightKg) : null,
        heightCm: client.heightCm ? Number(client.heightCm) : null,
        bmi,
        fitnessLevel: client.fitnessLevel,
        primaryGoal: client.primaryGoal,
      },
      goals: goals.map(g => {
        let progress = 0;
        if (g.startValue && g.targetValue && g.targetValue !== g.startValue) {
          const current = latestWeight ? Number(latestWeight) : Number(g.startValue);
          const start = Number(g.startValue);
          const target = Number(g.targetValue);
          progress = Math.min(100, Math.max(0, Math.round(((current - start) / (target - start)) * 100)));
        } else if (g.status === 'COMPLETED') {
          progress = 100;
        }
        return { ...g, progress };
      }),
      attendance: {
        attendanceRate,
        attendedCount: totalAttended,
        missedCount: totalMissed,
        totalRecords,
        recentRecords: attendanceRecords.slice(0, 10)
      },
      currentWorkoutPlan: workoutPlans[0] || null,
      workoutPlansCount: workoutPlans.length,
      recentAssessments: assessments,
      recentMeasurements: measurements,
      trainerNotes
    };
  }

  static async getClientActivity(trainerUserId: string, clientId: string, query: any) {
    await this.getClient(trainerUserId, clientId);

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '20', 10)));

    const [attendance, measurements, assessments, goals] = await Promise.all([
      prisma.attendance.findMany({
        where: { clientId },
        orderBy: { markedAt: 'desc' },
        take: pageSize,
        include: { session: { select: { name: true, category: true } } }
      }),
      prisma.bodyMeasurement.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
        take: pageSize
      }),
      prisma.fitnessAssessment.findMany({
        where: { clientId },
        orderBy: { assessedAt: 'desc' },
        take: pageSize
      }),
      prisma.fitnessGoal.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: pageSize
      })
    ]);

    const events: any[] = [];

    attendance.forEach(a => {
      events.push({
        id: `att-${a.id}`,
        type: 'ATTENDANCE',
        title: `Session Attendance: ${a.status}`,
        description: a.session?.name ? `${a.session.name} (${a.session.category})` : 'Fitness Session',
        timestamp: a.markedAt
      });
    });

    measurements.forEach(m => {
      events.push({
        id: `meas-${m.id}`,
        type: 'MEASUREMENT',
        title: 'Body Measurement Recorded',
        description: m.weightKg ? `Weight recorded: ${m.weightKg} kg` : 'Body measurements updated',
        timestamp: m.recordedAt
      });
    });

    assessments.forEach(ass => {
      events.push({
        id: `ass-${ass.id}`,
        type: 'ASSESSMENT',
        title: ass.isBaseline ? 'Baseline Assessment Completed' : 'Fitness Assessment Logged',
        description: ass.notes || `Endurance: ${ass.endurance || '-'}, Strength: ${ass.strength || '-'}`,
        timestamp: ass.assessedAt
      });
    });

    goals.forEach(g => {
      events.push({
        id: `goal-${g.id}`,
        type: 'GOAL',
        title: `Fitness Goal Created: ${g.title}`,
        description: g.targetValue ? `Target: ${g.targetValue} ${g.unit || ''}` : 'Active fitness goal',
        timestamp: g.createdAt
      });
    });

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalItems = events.length;
    const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginatedEvents,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 1
      }
    };
  }

  static async getClientProgress(trainerUserId: string, clientId: string, query: any) {
    const client = await this.getClient(trainerUserId, clientId);

    const fromDate = query.from ? new Date(query.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = query.to ? new Date(query.to) : new Date();
    const groupBy = (query.groupBy || 'month').toLowerCase(); // day, week, month, year

    const [measurements, progressLogs, attendance, goals, workoutPlans] = await Promise.all([
      prisma.bodyMeasurement.findMany({
        where: { clientId, recordedAt: { gte: fromDate, lte: toDate } },
        orderBy: { recordedAt: 'asc' }
      }),
      prisma.progressLog.findMany({
        where: { clientId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' }
      }),
      prisma.attendance.findMany({
        where: { clientId, markedAt: { gte: fromDate, lte: toDate } },
        orderBy: { markedAt: 'asc' }
      }),
      prisma.fitnessGoal.findMany({
        where: { clientId },
        orderBy: { createdAt: 'asc' },
        include: { milestones: true }
      }),
      prisma.workoutPlan.findMany({
        where: { clientId },
        include: { workouts: true }
      })
    ]);

    // Weight Trends Points
    const weightPoints: Array<{ date: string; value: number | null }> = [];
    measurements.forEach(m => {
      if (m.weightKg) {
        weightPoints.push({
          date: m.recordedAt.toISOString().split('T')[0],
          value: Number(m.weightKg)
        });
      }
    });

    // BMI Points
    const bmiPoints: Array<{ date: string; value: number | null }> = [];
    if (client.heightCm) {
      const heightM = Number(client.heightCm) / 100;
      weightPoints.forEach(p => {
        if (p.value) {
          const bmiVal = Math.round((p.value / (heightM * heightM)) * 10) / 10;
          bmiPoints.push({ date: p.date, value: bmiVal });
        }
      });
    }

    // Body Fat Points
    const bodyFatPoints: Array<{ date: string; value: number | null }> = [];
    measurements.forEach(m => {
      if (m.bodyFatPercent) {
        bodyFatPoints.push({
          date: m.recordedAt.toISOString().split('T')[0],
          value: Number(m.bodyFatPercent)
        });
      }
    });

    // Waist / Chest / Hip Measurements Points
    const waistPoints: Array<{ date: string; value: number | null }> = [];
    const chestPoints: Array<{ date: string; value: number | null }> = [];
    const hipPoints: Array<{ date: string; value: number | null }> = [];
    measurements.forEach(m => {
      const d = m.recordedAt.toISOString().split('T')[0];
      if (m.waistCm) waistPoints.push({ date: d, value: Number(m.waistCm) });
      if (m.chestCm) chestPoints.push({ date: d, value: Number(m.chestCm) });
      if (m.hipCm) hipPoints.push({ date: d, value: Number(m.hipCm) });
    });

    // Attendance Compliance
    const totalAttended = attendance.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = attendance.length > 0 ? Math.round((totalAttended / attendance.length) * 100) : 100;

    // Workout Compliance
    let totalAssignedWorkouts = 0;
    workoutPlans.forEach(wp => {
      totalAssignedWorkouts += wp.workouts.length;
    });
    const completedWorkouts = progressLogs.filter(p => p.workoutIntensity && p.workoutIntensity > 0).length || totalAttended;
    const workoutComplianceRate = totalAssignedWorkouts > 0 ? Math.min(100, Math.round((completedWorkouts / totalAssignedWorkouts) * 100)) : 100;

    // Weight Delta
    const currentWeight = weightPoints[weightPoints.length - 1]?.value || (client.currentWeightKg ? Number(client.currentWeightKg) : null);
    const startWeight = weightPoints[0]?.value || (client.startingWeightKg ? Number(client.startingWeightKg) : currentWeight);
    const weightChange = currentWeight !== null && startWeight !== null ? Math.round((currentWeight - startWeight) * 10) / 10 : 0;

    // Current BMI
    const currentBmi = bmiPoints[bmiPoints.length - 1]?.value || null;

    return {
      range: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      },
      groupBy,
      overview: {
        currentWeightKg: currentWeight,
        startingWeightKg: startWeight,
        targetWeightKg: client.targetWeightKg ? Number(client.targetWeightKg) : null,
        weightChange,
        currentBmi,
        attendanceRate,
        workoutComplianceRate,
        activeGoalsCount: goals.filter(g => g.status === 'ACTIVE').length
      },
      weight: {
        unit: 'kg',
        points: weightPoints
      },
      bmi: {
        points: bmiPoints
      },
      bodyFat: {
        unit: '%',
        points: bodyFatPoints
      },
      measurements: {
        waist: waistPoints,
        chest: chestPoints,
        hip: hipPoints
      },
      attendance: {
        rate: attendanceRate,
        attended: totalAttended,
        total: attendance.length
      },
      workoutCompliance: {
        rate: workoutComplianceRate,
        completed: completedWorkouts,
        assigned: totalAssignedWorkouts
      },
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        status: g.status,
        startValue: g.startValue ? Number(g.startValue) : null,
        targetValue: g.targetValue ? Number(g.targetValue) : null,
        currentValue: currentWeight,
        progress: g.status === 'COMPLETED' ? 100 : Math.min(100, Math.max(0, Math.round((((currentWeight || 0) - Number(g.startValue || 0)) / (Number(g.targetValue || 1) - Number(g.startValue || 0))) * 100)))
      }))
    };
  }

  static async getClientProgressAnalytics(trainerUserId: string, clientId: string, query: any) {
    const progress = await this.getClientProgress(trainerUserId, clientId, query);
    return {
      weight: {
        current: progress.overview.currentWeightKg,
        change: progress.overview.weightChange,
        trend: progress.overview.weightChange < 0 ? 'down' : progress.overview.weightChange > 0 ? 'up' : 'stable',
        points: progress.weight.points
      },
      attendance: {
        rate: progress.overview.attendanceRate,
        attended: progress.attendance.attended,
        total: progress.attendance.total
      },
      workoutCompliance: {
        rate: progress.overview.workoutComplianceRate,
        completed: progress.workoutCompliance.completed,
        assigned: progress.workoutCompliance.assigned
      },
      goalsSummary: {
        active: progress.overview.activeGoalsCount,
        goals: progress.goals
      }
    };
  }
}

