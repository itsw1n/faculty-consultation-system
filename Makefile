# =============================================================================
# Makefile — faculty-consultation-system (nextjs-supabase + Supabase)
# =============================================================================

.DEFAULT_GOAL := help
NPM_DIR := .

.PHONY: help dev build lint test test-e2e seed reset db-start db-stop db-reset db-test

help: ## Show all commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start dev server + Supabase local
	npm --prefix $(NPM_DIR) run supabase:start && npm --prefix $(NPM_DIR) run dev

build: ## Build frontend for production
	npm --prefix $(NPM_DIR) run build

lint: ## Run ESLint
	npm --prefix $(NPM_DIR) run lint

test: ## Run Vitest
	npm --prefix $(NPM_DIR) run test --if-present

test-e2e: ## Run Playwright E2E tests
	npm --prefix $(NPM_DIR) run test:e2e --if-present

seed: ## Load local demo accounts and sample consultations
	npm --prefix $(NPM_DIR) run supabase:seed

reset: ## Rebuild local DB from migrations only (no seed data)
	npm --prefix $(NPM_DIR) run supabase:reset:empty

db-start: ## Start local Supabase stack
	npm --prefix $(NPM_DIR) run supabase:start

db-stop: ## Stop local Supabase stack
	npm --prefix $(NPM_DIR) run supabase:stop

db-reset: ## Reset local DB (apply migrations + seed)
	npm --prefix $(NPM_DIR) run supabase:reset

db-test: ## Run local database and RLS tests
	npm --prefix $(NPM_DIR) run supabase:test
