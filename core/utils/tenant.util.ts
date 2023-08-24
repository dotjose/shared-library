import { ClsServiceManager } from "nestjs-cls";
export class TenantHelper {
  static getTenantHeaderKey(): string {
    return "tenantId";
  }
  getTenant(): string {
    const cls = ClsServiceManager.getClsService();
    return cls.get(TenantHelper.getTenantHeaderKey());
  }
  setTenant(tenant: any) {
    const cls = ClsServiceManager.getClsService();
    cls.set(TenantHelper.getTenantHeaderKey(), tenant);
  }
  static _getTenant(): string {
    const cls = ClsServiceManager.getClsService();
    return cls.get(TenantHelper.getTenantHeaderKey());
  }
}
