# Development Plan - Engine Results Viewer v2.1+

**Дата создания:** 7 ноября 2025
**Версия:** 1.0
**Статус:** В разработке

---

## Введение

Этот документ содержит архитектурные решения и roadmap развития Engine Results Viewer после релиза v2.0.0.

**Workflow:**
- Постепенное заполнение через обсуждение с пользователем
- Работаем поэтапно: закончили Q1 → зафиксировали → перешли к Q2
- После проработки всех вопросов → создание конкретных roadmap для фич

---

## Open Questions & Architectural Decisions

> Ответы на вопросы Q1-Q14 из [AUDIT-FINDINGS.md](AUDIT-FINDINGS.md) (Section: VII. Open Questions)

### Q1: Metadata Storage Location

**Вопрос из AUDIT:**
> Where should .metadata/ folder be located: inside engine-viewer/ or inside data folder (test-data/ or C:/4Stroke/)?

