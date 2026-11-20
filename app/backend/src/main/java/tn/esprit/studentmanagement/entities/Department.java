package tn.esprit.studentmanagement.entities;

import jakarta.persistence.*;
import lombok.*;
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Getter
@Setter
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
