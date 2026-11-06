#!/bin/bash
# Premier démarrage : noeud MASTER k3s + CNI Calico
set -eux
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git jq

curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" INSTALL_K3S_EXEC="server --flannel-backend=none --disable-network-policy --disable traefik --write-kubeconfig-mode 644" sh -

curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Attendre l'API k3s puis installer Calico (sinon les noeuds restent NotReady)
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
until kubectl get nodes >/dev/null 2>&1; do sleep 5; done

kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
cat <<EOC | kubectl create -f -
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  calicoNetwork:
    ipPools:
    - blockSize: 26
      cidr: 10.42.0.0/16
      encapsulation: VXLAN
      natOutgoing: Enabled
      nodeSelector: all()
EOC

# kubectl pour l'utilisateur ubuntu
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
echo 'export KUBECONFIG=$HOME/.kube/config' >> /home/ubuntu/.bashrc