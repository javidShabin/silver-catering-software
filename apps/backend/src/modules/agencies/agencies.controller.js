import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

// ─── AGENCY MANAGEMENT ──────────────────────────────────────────

export const getAllAgencies = catchAsync(async (req, res) => {
  
  const agencies = await prisma.manpowerAgency.findMany({
    where: { },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignments: true }
      }
    }
  });

  res.status(200).json({ status: "success", data: agencies });
});

export const getAgency = catchAsync(async (req, res) => {
  
  const { id } = req.params;

  const agency = await prisma.manpowerAgency.findFirst({
    where: { id},
    include: {
      assignments: {
        include: {
          event: {
            select: { title: true, date: true, status: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!agency) throw new AppError("Agency not found", 404);

  res.status(200).json({ status: "success", data: agency });
});

export const createAgency = catchAsync(async (req, res) => {
  
  const { name, phone, serviceType, address, isActive } = req.body;

  const existing = await prisma.manpowerAgency.findFirst({
    where: {  name: { equals: name, mode: 'insensitive' } }
  });

  if (existing) throw new AppError("An agency with this name already exists", 400);

  const agency = await prisma.manpowerAgency.create({
    data: {
      
      name,
      phone: phone || null,
      serviceType: serviceType || null,
      address: address || null,
      isActive: isActive !== undefined ? isActive : true
    }
  });

  res.status(201).json({ status: "success", data: agency });
});

export const updateAgency = catchAsync(async (req, res) => {
  
  const { id } = req.params;
  const { name, phone, serviceType, address, isActive } = req.body;

  const agency = await prisma.manpowerAgency.findFirst({ where: { id} });
  if (!agency) throw new AppError("Agency not found", 404);

  if (name && name !== agency.name) {
    const existing = await prisma.manpowerAgency.findFirst({
      where: {  name: { equals: name, mode: 'insensitive' } }
    });
    if (existing) throw new AppError("An agency with this name already exists", 400);
  }

  const updated = await prisma.manpowerAgency.update({
    where: { id },
    data: {
      name,
      phone,
      serviceType,
      address,
      isActive
    }
  });

  res.status(200).json({ status: "success", data: updated });
});

export const deleteAgency = catchAsync(async (req, res) => {
  
  const { id } = req.params;

  const agency = await prisma.manpowerAgency.findFirst({ where: { id} });
  if (!agency) throw new AppError("Agency not found", 404);

  const assignmentsCount = await prisma.agencyAssignment.count({ where: { agencyId: id } });
  if (assignmentsCount > 0) {
    throw new AppError("Cannot delete agency with existing assignments. Please deactivate it instead.", 400);
  }

  await prisma.manpowerAgency.delete({ where: { id } });

  res.status(204).json({ status: "success", data: null });
});

// ─── AGENCY EVENT ASSIGNMENTS ───────────────────────────────────

export const getAllAssignments = catchAsync(async (req, res) => {
  
  
  const assignments = await prisma.agencyAssignment.findMany({
    where: { },
    include: {
      agency: {
        select: { id: true, name: true, phone: true, serviceType: true }
      },
      event: {
        select: { id: true, title: true, date: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ status: "success", data: assignments });
});

export const getEventAssignments = catchAsync(async (req, res) => {
  
  const { eventId } = req.params;

  const assignments = await prisma.agencyAssignment.findMany({
    where: {  eventId },
    include: {
      agency: {
        select: { id: true, name: true, phone: true, serviceType: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ status: "success", data: assignments });
});

export const assignAgency = catchAsync(async (req, res) => {
  
  const { agencyId, eventId, numberOfStaff, rentalItems, numberOfDays, totalAmount, advancePaid, status, notes } = req.body;

  // Validate event and agency
  const event = await prisma.event.findFirst({ where: { id: eventId} });
  if (!event) throw new AppError("Event not found", 404);

  const agency = await prisma.manpowerAgency.findFirst({ where: { id: agencyId} });
  if (!agency) throw new AppError("Agency not found", 404);

  const assignment = await prisma.agencyAssignment.create({
    data: {
      
      eventId,
      agencyId,
      numberOfStaff: numberOfStaff || 0,
      rentalItems: rentalItems || [],
      numberOfDays: numberOfDays || 1,
      totalAmount,
      advancePaid: advancePaid || 0,
      status: status || "pending",
      notes: notes || null
    },
    include: {
      agency: {
        select: { id: true, name: true, phone: true, serviceType: true }
      }
    }
  });

  res.status(201).json({ status: "success", data: assignment });
});

export const updateAssignment = catchAsync(async (req, res) => {
  
  const { id } = req.params;
  
  const existing = await prisma.agencyAssignment.findFirst({ where: { id} });
  if (!existing) throw new AppError("Assignment not found", 404);

  const updated = await prisma.agencyAssignment.update({
    where: { id },
    data: req.body,
    include: {
      agency: {
        select: { id: true, name: true, phone: true, serviceType: true }
      }
    }
  });

  res.status(200).json({ status: "success", data: updated });
});

export const deleteAssignment = catchAsync(async (req, res) => {
  
  const { id } = req.params;

  const existing = await prisma.agencyAssignment.findFirst({ where: { id} });
  if (!existing) throw new AppError("Assignment not found", 404);

  await prisma.agencyAssignment.delete({ where: { id } });

  res.status(204).json({ status: "success", data: null });
});
