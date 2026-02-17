/**
 * Promove um usuário existente a PLATFORM_ADMIN via Supabase Auth.
 *
 * Uso:
 *   pnpm --filter api exec tsx scripts/set-platform-admin.ts <email>
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: tsx scripts/set-platform-admin.ts <email>");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey);

  // Buscar usuário pelo email
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Erro ao listar usuários:", listError.message);
    process.exit(1);
  }

  const user = listData.users.find((u) => u.email === email);
  if (!user) {
    console.error(`Usuário com email "${email}" não encontrado no Supabase Auth.`);
    process.exit(1);
  }

  // Setar platform_role no app_metadata
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, platform_role: "PLATFORM_ADMIN" },
  });

  if (updateError) {
    console.error("Erro ao atualizar app_metadata:", updateError.message);
    process.exit(1);
  }

  console.log(`✔ Usuário "${email}" (${user.id}) promovido a PLATFORM_ADMIN.`);
}

main();
