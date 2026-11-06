#!/bin/bash
# Premier démarrage : noeud WORKER k3s (rejoint le master)
set -eux
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git jq

# Attendre que l'API du master réponde (port 6443)
for i in $(seq 1 60); do
  if curl -sk --max-time 3 https://${master_private_ip}:6443 >/dev/null; then break; fi
  sleep 10
done

curl -sfL https://get.k3s.io | K3S_URL="https://${master_private_ip}:6443" K3S_TOKEN="${k3s_token}" INSTALL_K3S_EXEC="agent" sh -

# Script optionnel : Jenkins + SonarQube en Docker sur ce worker (à lancer à la main)
cat > /home/ubuntu/bootstrap-ci.sh <<'EOS'
#!/bin/bash
set -eux
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-sonarqube.conf
sudo sysctl --system

sudo mkdir -p /opt/ci && cd /opt/ci
sudo tee docker-compose.yml >/dev/null <<'EOC'
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    restart: always
    user: root
    ports: ["8080:8080"]
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock

  sonar-db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: changeme-local
      POSTGRES_DB: sonar
    volumes:
      - sonar_db:/var/lib/postgresql/data

  sonarqube:
    image: sonarqube:lts-community
    restart: always
    depends_on: [sonar-db]
    ports: ["9000:9000"]
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://sonar-db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: changeme-local
    volumes:
      - sonar_data:/opt/sonarqube/data
      - sonar_ext:/opt/sonarqube/extensions

volumes:
  jenkins_home:
  sonar_db:
  sonar_data:
  sonar_ext:
EOC
sudo docker compose up -d
echo "Jenkins : http://localhost:8080 (via tunnel) - SonarQube : http://localhost:9000 (admin/admin)"
echo "Mot de passe initial Jenkins :"
sleep 45
sudo docker exec $(sudo docker ps -qf name=jenkins) cat /var/jenkins_home/secrets/initialAdminPassword
EOS
chmod +x /home/ubuntu/bootstrap-ci.sh
chown ubuntu:ubuntu /home/ubuntu/bootstrap-ci.sh