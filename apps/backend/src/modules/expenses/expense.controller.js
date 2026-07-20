import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import { invalidateTenantReports } from "../../utils/cacheInvalidator.js";

export const getAllExpenses = async (req, res, next) => {
  try {
    const { cursor, limit = 10, category } = req.query;
    const limitNum = Math.min(Number(limit) || 10, 100);
    

    const where = { };
    if (category && category !== "all") where.category = category;

    const query = {
      where,
      include: {
        event: true},
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: limitNum + 1};

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    const expenses = await prisma.expense.findMany(query);

    let nextCursor = null;
    if (expenses.length > limitNum) {
      const nextItem = expenses.pop();
      nextCursor = nextItem.id;
    }

    res.status(200).json({
      status: "success",
      results: expenses.length,
      nextCursor,
      data: {
        expenses}});
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (req, res, next) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id},
      include: { event: true }});

    if (!expense) {
      return next(new AppError("No expense found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        expense}});
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { id,  createdAt, updatedAt, ...allowedData } = req.body;
    const newExpense = await prisma.expense.create({
      data: {
        ...allowedData}});

    res.status(201).json({
      status: "success",
      data: {
        expense: newExpense}});

    invalidateTenantReports();
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      return next(new AppError("No expense found with that ID", 404));
    }

    const { id,  createdAt, updatedAt, ...allowedData } = req.body;
    const updatedExpense = await prisma.expense.update({
      where: { id: req.params.id },
      data: allowedData});

    res.status(200).json({
      status: "success",
      data: {
        expense: updatedExpense}});

    invalidateTenantReports();
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      return next(new AppError("No expense found with that ID", 404));
    }

    await prisma.expense.delete({
      where: { id: req.params.id }});

    res.status(204).json({
      status: "success",
      data: null});

    invalidateTenantReports();
  } catch (error) {
    next(error);
  }
};
