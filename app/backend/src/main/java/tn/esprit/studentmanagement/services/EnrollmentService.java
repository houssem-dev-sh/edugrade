package tn.esprit.studentmanagement.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.studentmanagement.entities.Enrollment;
import tn.esprit.studentmanagement.repositories.EnrollmentRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class EnrollmentService implements IEnrollmentService {

    private EnrollmentRepository enrollmentRepository;

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id).orElse(null);
    }

    public Enrollment saveEnrollment(Enrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }

    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
}
