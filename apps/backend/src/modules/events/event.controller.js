import catchAsync from "../../utils/catchAsync.js";
import eventService from "./event.service.js";
import { invalidateTenantReports } from "../../utils/cacheInvalidator.js";
import prisma from "../../utils/prisma.js";

/**
 * Get all events with filtering and pagination
 */
export const getAllEvents = catchAsync(async (req, res) => {
  const { events, nextCursor } = await eventService.getAllEvents({ 
    ...req.query});

  res.status(200).json({
    status: "success",
    results: events.length,
    nextCursor,
    data: events});
});

/**
 * Get lightweight event list for dropdowns (additive optimization)
 */
export const getEventLookup = catchAsync(async (req, res) => {
  
  const events = await prisma.event.findMany({
    where: {  deletedAt: null },
    select: {
      id: true,
      title: true,
      date: true,
      customer: { select: { id: true } }
    },
    orderBy: [{ date: "desc" }, { id: "desc" }]
  });
  res.status(200).json({
    status: "success",
    data: events});
});

/**
 * Get count of overdue incomplete events
 */
export const getOverdueCount = catchAsync(async (req, res) => {
  const count = await eventService.getOverdueCount();
  res.status(200).json({
    status: "success",
    data: { count }});
});

/**
 * Get a single event by ID
 */
export const getEvent = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);

  res.status(200).json({
    status: "success",
    data: event});
});

/**
 * Create a new event
 */
export const createEvent = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const newEvent = await eventService.createEvent(req.body, userId);

  res.status(201).json({
    status: "success",
    data: newEvent});

  invalidateTenantReports();
});

/**
 * Update an event
 */
export const updateEvent = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedEvent = await eventService.updateEvent(req.params.id, req.body, userId);

  res.status(200).json({
    status: "success",
    data: updatedEvent});

  invalidateTenantReports();
});

/**
 * Delete an event
 */
export const deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id);

  res.status(204).json({
    status: "success",
    data: null});

  invalidateTenantReports();
});
