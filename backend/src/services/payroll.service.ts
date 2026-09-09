import { SalaryModel, PayrollModel } from '../models/payroll.model';
import { EmployeeModel } from '../models/employee.model';
import { AppError } from '../utils/AppError';
import { SetSalaryInput, GeneratePayrollInput, PayrollQuery } from '../validators/payroll.validator';

async function resolveEmployeeId(userId: number): Promise<number> {
  const employee = await EmployeeModel.findByUserId(userId);
  if (!employee) throw new AppError('No employee profile linked to this account', 404);
  return employee.employee_id;
}

async function generateForOne(employeeId: number, month: number, year: number, deductions: number) {
  const salary = await SalaryModel.findByEmployee(employeeId);
  if (!salary) {
    throw new AppError(`No salary structure set for employee ${employeeId}`, 400);
  }

  const alreadyExists = await PayrollModel.exists(employeeId, month, year);
  if (alreadyExists) {
    throw new AppError(`Payroll for employee ${employeeId} already generated for ${month}/${year}`, 409);
  }

  const totalAllowances = Number(salary.hra) + Number(salary.other_allowances);
  const netSalary = Number(salary.basic_salary) + totalAllowances - deductions;

  const id = await PayrollModel.create(
    employeeId,
    month,
    year,
    Number(salary.basic_salary),
    totalAllowances,
    deductions,
    netSalary
  );
  return PayrollModel.findById(id);
}

export const PayrollService = {
  async setSalary(employeeId: number, input: SetSalaryInput) {
    await SalaryModel.upsert(employeeId, input.basicSalary, input.hra, input.otherAllowances, input.effectiveFrom);
    return SalaryModel.findByEmployee(employeeId);
  },

  async getSalary(employeeId: number) {
    const salary = await SalaryModel.findByEmployee(employeeId);
    if (!salary) throw new AppError('No salary structure found for this employee', 404);
    return salary;
  },

  async generate(input: GeneratePayrollInput) {
    if (input.employeeId) {
      return [await generateForOne(input.employeeId, input.month, input.year, input.deductions)];
    }

    // Bulk generation for all active employees with a salary structure
    const salaries = await SalaryModel.findAllActiveWithSalary();
    const results = [];
    for (const salary of salaries) {
      const exists = await PayrollModel.exists(salary.employee_id, input.month, input.year);
      if (exists) continue; // skip already generated, don't fail the whole batch
      results.push(await generateForOne(salary.employee_id, input.month, input.year, input.deductions));
    }
    return results;
  },

  async list(filters: PayrollQuery) {
    const { rows, total } = await PayrollModel.findAll(filters);
    return {
      payroll: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getById(id: number) {
    const record = await PayrollModel.findById(id);
    if (!record) throw new AppError('Payroll record not found', 404);
    return record;
  },

  async myPayslips(userId: number) {
    const employeeId = await resolveEmployeeId(userId);
    return PayrollModel.findByEmployee(employeeId);
  },

  async markPaid(id: number) {
    await this.getById(id);
    await PayrollModel.markPaid(id);
    return this.getById(id);
  },
};