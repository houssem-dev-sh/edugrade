data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_security_group" "default" {
  name   = "default"
  vpc_id = data.aws_vpc.default.id
}

# Jeton secret partagé : permet aux workers de rejoindre le master
resource "random_password" "k3s_token" {
  length  = 32
  special = false
}

resource "aws_security_group" "edugrade" {
  count       = var.create_sg ? 1 : 0
  name        = "edugrade-sg"
  description = "EduGrade: SSH restreint, trafic interne"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH depuis mon IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  ingress {
    description = "Trafic entre les noeuds (API k3s, VXLAN Calico, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "edugrade-sg", Project = "EduGrade" }
}

locals {
  sg_ids = var.create_sg ? [aws_security_group.edugrade[0].id] : [data.aws_security_group.default.id]
}

# --- k3s MASTER (control plane) ---
resource "aws_instance" "master" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.master_instance_type
  key_name               = var.key_name
  vpc_security_group_ids = local.sg_ids
  user_data = templatefile("${path.module}/scripts/k3s-master.sh", {
    k3s_token = random_password.k3s_token.result
  })

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = { Name = "edugrade-k3s-master", Project = "EduGrade", Role = "k3s-master" }
}

# --- k3s WORKER(s) ---
resource "aws_instance" "worker" {
  count                  = var.worker_count
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.worker_instance_type
  key_name               = var.key_name
  vpc_security_group_ids = local.sg_ids
  user_data = templatefile("${path.module}/scripts/k3s-worker.sh", {
    k3s_token         = random_password.k3s_token.result
    master_private_ip = aws_instance.master.private_ip
  })

  root_block_device {
    volume_size = 40
    volume_type = "gp3"
  }

  tags = { Name = "edugrade-k3s-worker-${count.index + 1}", Project = "EduGrade", Role = "k3s-worker" }
}

# IP fixes (sinon l'IP publique change à chaque arrêt/démarrage)
resource "aws_eip" "master" {
  instance = aws_instance.master.id
  domain   = "vpc"
}

resource "aws_eip" "worker" {
  count    = var.worker_count
  instance = aws_instance.worker[count.index].id
  domain   = "vpc"
}