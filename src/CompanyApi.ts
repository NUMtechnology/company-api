export interface CompanyApi {
  run(): void;
}

export const createCompanyApi = (): CompanyApi => new CompanyApiImpl();

class CompanyApiImpl implements CompanyApi {
  run(): void {
    throw new Error('Method not implemented.');
  }
}
