import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.client = createClient(url, serviceRoleKey);
  }

  async verifyToken(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    const platformRole =
      (data.user.app_metadata as Record<string, unknown>)?.platform_role;
    return {
      id: data.user.id,
      email: data.user.email,
      platformRole: platformRole === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' as const : null,
    };
  }

  async inviteUserByEmail(email: string): Promise<{ id: string; email: string }> {
    const { data, error } = await this.client.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    return { id: data.user.id, email: data.user.email! };
  }

  async findOrCreateUserByEmail(email: string): Promise<{ id: string; email: string; created: boolean }> {
    // Tenta convidar (cria user + envia email com link para definir senha)
    const { data, error } = await this.client.auth.admin.inviteUserByEmail(email);
    if (!error) {
      return { id: data.user.id, email: data.user.email!, created: true };
    }

    // Se falhou porque user já existe, busca pelo email
    const { data: listData, error: listError } = await this.client.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = listData.users.find(u => u.email === email);
    if (!existing) throw error; // erro original do invite
    return { id: existing.id, email: existing.email!, created: false };
  }
}
