import { DesignationModel } from '../models/designation.model';
import { AppError } from '../utils/AppError';
import { CreateDesignationInput, UpdateDesignationInput } from '../validators/designation.validator';

export const DesignationService = {
  async list() {
    return DesignationModel.findAll();
  },

  async getById(id: number) {
    const designation = await DesignationModel.findById(id);
    if (!designation) throw new AppError('Designation not found', 404);
    return designation;
  },

  async create(input: CreateDesignationInput) {
    const existing = await DesignationModel.findByTitle(input.title);
    if (existing) throw new AppError('A designation with this title already exists', 409);
    const id = await DesignationModel.create(input.title, input.level ?? 1);
    return this.getById(id);
  },

  async update(id: number, input: UpdateDesignationInput) {
    await this.getById(id);
    await DesignationModel.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    await DesignationModel.delete(id);
  },
};