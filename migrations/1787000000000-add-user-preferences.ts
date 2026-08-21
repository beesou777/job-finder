import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserPreferences1787000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    const table = await queryRunner.getTable("users");
    if (!table) return;
    const columns = [
      ["preferredRole", "varchar", true],
      ["preferredLocation", "varchar", true],
      ["preferredJobType", "varchar", true],
      ["preferredWorkMode", "varchar", true],
      ["emailAlerts", "boolean", false],
      ["updatedAt", "timestamp", false],
    ] as const;
    for (const [name, type, isNullable] of columns) {
      if (!table.findColumnByName(name)) {
        await queryRunner.addColumn(
          "users",
          new TableColumn({
            name,
            type,
            isNullable,
            default: name === "emailAlerts" ? "true" : undefined,
          }),
        );
      }
    }
  }
  async down(queryRunner: QueryRunner) {
    for (const name of [
      "updatedAt",
      "emailAlerts",
      "preferredWorkMode",
      "preferredJobType",
      "preferredLocation",
      "preferredRole",
    ]) {
      const table = await queryRunner.getTable("users");
      if (table?.findColumnByName(name)) await queryRunner.dropColumn("users", name);
    }
  }
}
