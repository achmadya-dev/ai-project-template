export function hasAdminRole(role: string | null | undefined): boolean {
  return role?.split(',').includes('admin') ?? false
}
