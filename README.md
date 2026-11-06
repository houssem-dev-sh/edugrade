# EduGrade — Projet DevSecOps
Portail de notes (ADMIN / ENSEIGNANT / ÉTUDIANT) — TEK-UP, module DevSecOps.

## Structure
- app/ : backend Spring Boot + frontend React
- db/ : scripts MariaDB et seed
- pipeline/ : Jenkinsfile, politique de blocage
- gitops/ : chart Helm, ArgoCD, SealedSecrets, NetworkPolicy, Kyverno
- infra/ : Terraform / scripts AWS
- observability/ : Loki, Prometheus, Falco, Grafana, ZAP
- docs/ : cahier des charges, rapport, post-mortem

## Contribution
Une branche par tâche (feat/<nom>-<sujet>), Pull Request vers main, relue avant merge.
