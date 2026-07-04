# Deployment

## Docker
The app is built as a multi-stage Docker container utilizing Next.js `standalone` output for minimal image size.

## Kubernetes
Kubernetes manifests (`/k8s`) define:
- Deployments
- Services
- Ingress (cert-manager integration)
- ConfigMaps & Secrets
- HPA for autoscaling

## Helm
A full Helm chart is available in `/helm/nexus-platform` for easy installation.
