CREATE TABLE `applications` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `gender` text NOT NULL,
  `student_id` text NOT NULL,
  `college` text NOT NULL,
  `major_class` text NOT NULL,
  `political_status` text DEFAULT '群众' NOT NULL,
  `phone` text NOT NULL,
  `wechat` text NOT NULL,
  `qq` text DEFAULT '' NOT NULL,
  `email` text DEFAULT '' NOT NULL,
  `choice_1` text NOT NULL,
  `choice_2` text NOT NULL,
  `choice_3` text NOT NULL,
  `introduction` text NOT NULL,
  `experience` text DEFAULT '' NOT NULL,
  `expectation` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_student_id_unique` ON `applications` (`student_id`);
--> statement-breakpoint
CREATE INDEX `idx_applications_choice_1` ON `applications` (`choice_1`);
--> statement-breakpoint
CREATE INDEX `idx_applications_choice_2` ON `applications` (`choice_2`);
--> statement-breakpoint
CREATE INDEX `idx_applications_choice_3` ON `applications` (`choice_3`);
