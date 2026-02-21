CREATE TABLE "dim_booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"dim_client_id" uuid NOT NULL,
	"dim_professional_id" uuid,
	"dim_service_id" uuid,
	"dim_court_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"price_charged" integer,
	"notes" text,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"dim_chat_session_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dim_chat_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_chat_session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text,
	"tool_name" text,
	"tool_input" jsonb,
	"tool_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dim_chat_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"dim_client_id" uuid,
	"message_count" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dim_client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "dim_client_org_phone_unique" UNIQUE("dim_organization_id","phone")
);
--> statement-breakpoint
CREATE TABLE "dim_court" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sport" text NOT NULL,
	"description" text,
	"price_per_slot" integer NOT NULL,
	"slot_duration_minutes" integer DEFAULT 60 NOT NULL,
	"break_between_minutes" integer DEFAULT 0 NOT NULL,
	"operating_hours" jsonb,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dim_organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_organization_id" char(31) NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_master_org" boolean DEFAULT false NOT NULL,
	"is_template_org" boolean DEFAULT false NOT NULL,
	"slug" text,
	"business_type" text,
	"business_hours" jsonb,
	"timezone" text DEFAULT 'America/Sao_Paulo',
	"phone" text,
	"address" text,
	"logo_url" text,
	"chat_welcome_message" text,
	"chat_instructions" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid NOT NULL,
	"last_updated_by" uuid NOT NULL,
	CONSTRAINT "dim_organization_clerk_organization_id_unique" UNIQUE("clerk_organization_id"),
	CONSTRAINT "dim_organization_email_unique" UNIQUE("email"),
	CONSTRAINT "dim_organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dim_organization_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"dim_user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dim_professional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"working_hours" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dim_professional_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_professional_id" uuid NOT NULL,
	"dim_service_id" uuid NOT NULL,
	"custom_duration_minutes" integer,
	"custom_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "dim_professional_service_unique" UNIQUE("dim_professional_id","dim_service_id")
);
--> statement-breakpoint
CREATE TABLE "dim_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dim_organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"duration_minutes" integer NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dim_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" char(32) NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "dim_user_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "dim_user_email_unique" UNIQUE("email"),
	CONSTRAINT "dim_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_client_id_dim_client_id_fk" FOREIGN KEY ("dim_client_id") REFERENCES "public"."dim_client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_professional_id_dim_professional_id_fk" FOREIGN KEY ("dim_professional_id") REFERENCES "public"."dim_professional"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_service_id_dim_service_id_fk" FOREIGN KEY ("dim_service_id") REFERENCES "public"."dim_service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_court_id_dim_court_id_fk" FOREIGN KEY ("dim_court_id") REFERENCES "public"."dim_court"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_booking" ADD CONSTRAINT "dim_booking_dim_chat_session_id_dim_chat_session_id_fk" FOREIGN KEY ("dim_chat_session_id") REFERENCES "public"."dim_chat_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_chat_message" ADD CONSTRAINT "dim_chat_message_dim_chat_session_id_dim_chat_session_id_fk" FOREIGN KEY ("dim_chat_session_id") REFERENCES "public"."dim_chat_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_chat_session" ADD CONSTRAINT "dim_chat_session_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_chat_session" ADD CONSTRAINT "dim_chat_session_dim_client_id_dim_client_id_fk" FOREIGN KEY ("dim_client_id") REFERENCES "public"."dim_client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_client" ADD CONSTRAINT "dim_client_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_court" ADD CONSTRAINT "dim_court_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_organization" ADD CONSTRAINT "dim_organization_created_by_dim_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."dim_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_organization" ADD CONSTRAINT "dim_organization_last_updated_by_dim_user_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."dim_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_organization_member" ADD CONSTRAINT "dim_organization_member_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_organization_member" ADD CONSTRAINT "dim_organization_member_dim_user_id_dim_user_id_fk" FOREIGN KEY ("dim_user_id") REFERENCES "public"."dim_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_professional" ADD CONSTRAINT "dim_professional_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_professional_service" ADD CONSTRAINT "dim_professional_service_dim_professional_id_dim_professional_id_fk" FOREIGN KEY ("dim_professional_id") REFERENCES "public"."dim_professional"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_professional_service" ADD CONSTRAINT "dim_professional_service_dim_service_id_dim_service_id_fk" FOREIGN KEY ("dim_service_id") REFERENCES "public"."dim_service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dim_service" ADD CONSTRAINT "dim_service_dim_organization_id_dim_organization_id_fk" FOREIGN KEY ("dim_organization_id") REFERENCES "public"."dim_organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dim_booking_org_idx" ON "dim_booking" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_booking_client_idx" ON "dim_booking" USING btree ("dim_client_id");--> statement-breakpoint
CREATE INDEX "dim_booking_professional_idx" ON "dim_booking" USING btree ("dim_professional_id");--> statement-breakpoint
CREATE INDEX "dim_booking_court_idx" ON "dim_booking" USING btree ("dim_court_id");--> statement-breakpoint
CREATE INDEX "dim_booking_time_idx" ON "dim_booking" USING btree ("dim_organization_id","start_time","end_time");--> statement-breakpoint
CREATE INDEX "dim_booking_status_idx" ON "dim_booking" USING btree ("dim_organization_id","status");--> statement-breakpoint
CREATE INDEX "dim_chat_message_session_idx" ON "dim_chat_message" USING btree ("dim_chat_session_id");--> statement-breakpoint
CREATE INDEX "dim_chat_message_created_idx" ON "dim_chat_message" USING btree ("dim_chat_session_id","created_at");--> statement-breakpoint
CREATE INDEX "dim_chat_session_org_idx" ON "dim_chat_session" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_chat_session_client_idx" ON "dim_chat_session" USING btree ("dim_client_id");--> statement-breakpoint
CREATE INDEX "dim_client_org_idx" ON "dim_client" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_client_phone_idx" ON "dim_client" USING btree ("dim_organization_id","phone");--> statement-breakpoint
CREATE INDEX "dim_court_org_idx" ON "dim_court" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_court_active_idx" ON "dim_court" USING btree ("dim_organization_id","is_active");--> statement-breakpoint
CREATE INDEX "dim_organization_clerk_id_idx" ON "dim_organization" USING btree ("clerk_organization_id");--> statement-breakpoint
CREATE INDEX "dim_organization_email_idx" ON "dim_organization" USING btree ("email");--> statement-breakpoint
CREATE INDEX "dim_organization_is_master_idx" ON "dim_organization" USING btree ("is_master_org");--> statement-breakpoint
CREATE INDEX "dim_organization_is_template_idx" ON "dim_organization" USING btree ("is_template_org");--> statement-breakpoint
CREATE INDEX "dim_organization_slug_idx" ON "dim_organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "dim_organization_member_org_user_idx" ON "dim_organization_member" USING btree ("dim_organization_id","dim_user_id");--> statement-breakpoint
CREATE INDEX "dim_organization_member_user_idx" ON "dim_organization_member" USING btree ("dim_user_id");--> statement-breakpoint
CREATE INDEX "dim_professional_org_idx" ON "dim_professional" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_professional_active_idx" ON "dim_professional" USING btree ("dim_organization_id","is_active");--> statement-breakpoint
CREATE INDEX "dim_professional_service_professional_idx" ON "dim_professional_service" USING btree ("dim_professional_id");--> statement-breakpoint
CREATE INDEX "dim_professional_service_service_idx" ON "dim_professional_service" USING btree ("dim_service_id");--> statement-breakpoint
CREATE INDEX "dim_service_org_idx" ON "dim_service" USING btree ("dim_organization_id");--> statement-breakpoint
CREATE INDEX "dim_service_active_idx" ON "dim_service" USING btree ("dim_organization_id","is_active");--> statement-breakpoint
CREATE INDEX "dim_user_clerk_id_idx" ON "dim_user" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "dim_user_email_idx" ON "dim_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "dim_user_username_idx" ON "dim_user" USING btree ("username");