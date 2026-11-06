variable "region" {
  type    = string
  default = "us-east-1"
}

variable "key_name" {
  description = "Paire de clés existante (Learner Lab : vockey)"
  type        = string
  default     = "vockey"
}

variable "my_ip_cidr" {
  description = "Ton IP publique en /32, ex: 41.226.x.x/32"
  type        = string
}

variable "master_instance_type" {
  type    = string
  default = "t3.large"
}

variable "worker_instance_type" {
  type    = string
  default = "t3.large"
}

variable "worker_count" {
  description = "Nombre de noeuds worker k3s"
  type        = number
  default     = 1
}

variable "create_sg" {
  description = "false = utiliser le Security Group default"
  type        = bool
  default     = true
}