output "master_public_ip"  { value = aws_eip.master.public_ip }
output "worker_public_ips" { value = aws_eip.worker[*].public_ip }

output "ssh_master" { value = "ssh -i labsuser.pem ubuntu@${aws_eip.master.public_ip}" }
output "ssh_workers" {
  value = [for e in aws_eip.worker : "ssh -i labsuser.pem ubuntu@${e.public_ip}"]
}

output "tunnels" {
  value = <<-EOT
    # Jenkins (8080) et SonarQube (9000) - sur le worker 1, apres ./bootstrap-ci.sh
    ssh -i labsuser.pem -L 8080:localhost:8080 -L 9000:localhost:9000 ubuntu@${aws_eip.worker[0].public_ip}
    # Application via ingress-nginx (apres installation) -> https://localhost:30443
    ssh -i labsuser.pem -L 30443:localhost:30443 ubuntu@${aws_eip.master.public_ip}
  EOT
}