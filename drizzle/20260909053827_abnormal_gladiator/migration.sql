PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_menu_schedules` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`date` text NOT NULL UNIQUE,
	`ingredients` text
);
--> statement-breakpoint
INSERT INTO `__new_menu_schedules`(`id`, `name`, `date`, `ingredients`) SELECT `id`, `name`, `date`, `ingredients` FROM `menu_schedules`;--> statement-breakpoint
DROP TABLE `menu_schedules`;--> statement-breakpoint
ALTER TABLE `__new_menu_schedules` RENAME TO `menu_schedules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;