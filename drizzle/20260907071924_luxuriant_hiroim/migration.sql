CREATE TABLE `ingredients` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `menu_schedules` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`ingredients` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menus` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`recipe` text
);
