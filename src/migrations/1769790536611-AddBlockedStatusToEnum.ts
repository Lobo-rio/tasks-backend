import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockedStatusToEnum1769790536611 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_status_enum" ADD VALUE 'blocked'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't allow removing enum values, so we can't revert this
  }
}
