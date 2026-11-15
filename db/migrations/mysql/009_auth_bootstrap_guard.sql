CREATE TABLE `auth_bootstrap_guard` (`id` INTEGER PRIMARY KEY, CONSTRAINT `auth_bootstrap_guard_singleton` CHECK (`id` = 1))
