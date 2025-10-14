package com.gnomeland.foodlab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recipes")
@Getter
@Setter
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    @Column(columnDefinition = "VARCHAR(20)") // Храним как строку
    private String preparationTime; // Изменили с Duration на String

    @OneToMany(mappedBy = "recipeId", fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnore
    @JoinTable(name = "recipe_users",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();

    public void addIngredient(RecipeIngredient ingredient) {
        ingredient.setRecipe(this);
        this.recipeIngredients.add(ingredient);
    }

    public Duration getPreparationTimeAsDuration() {
        return Duration.parse(preparationTime);
    }

    public void setPreparationTimeFromDuration(Duration duration) {
        this.preparationTime = duration.toString();
    }
}
