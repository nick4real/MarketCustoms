const { execSync } = require('child_process');

const args = process.argv.slice(2);
const action = args[0];       // 'add', 'remove', or 'list'
const service = args[1];      // e.g., 'Catalog', 'Order'
const extraParam = args[2];   // Migration name (for 'add')

if (!action || !service) {
  console.error('❌ Missing arguments.');
  console.error('   Usage: npm run ef:<action> -- <ServiceName> [MigrationName]');
  process.exit(1);
}

const infra = `Services/${service}/MC.${service}.Infrastructure/MC.${service}.Infrastructure.csproj`;
const api = `Services/${service}/MC.${service}.Api/MC.${service}.Api.csproj`;

let command = '';

switch (action) {
  case 'add':
    if (!extraParam) {
      console.error('❌ Migration name required for ef:add.');
      console.error('   Example: npm run ef:add -- Catalog AddCategoryTree');
      process.exit(1);
    }
    command = `dotnet ef migrations add ${extraParam} --project ${infra} --startup-project ${api}`;
    break;

  case 'remove':
    // Removes the last unapplied migration file
    command = `dotnet ef migrations remove --project ${infra} --startup-project ${api}`;
    break;

  case 'list':
    // Lists all migrations and their applied status
    command = `dotnet ef migrations list --project ${infra} --startup-project ${api}`;
    break;

  default:
    console.error(`❌ Unknown action: ${action}`);
    process.exit(1);
}

console.log(`🚀 Executing (${action.toUpperCase()} - ${service}):\n   ${command}\n`);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error(`\n❌ Failed to execute EF command for ${service}.`);
  process.exit(1);
}