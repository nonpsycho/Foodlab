package com.gnomeland.foodlab.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Duration;
import java.util.List;

import com.gnomeland.foodlab.exception.ValidationException;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class RecipeDto {
    private Integer id;
    private String name;
    private String preparationTime; // Строковое представление (ISO-8601)

    // Методы для удобной работы
    @JsonIgnore
    public Duration getPreparationDuration() {
        try {
            return preparationTime != null ? Duration.parse(preparationTime) : null;
        } catch (Exception e) {
            throw new ValidationException("Invalid duration format");
        }
    }

    @JsonIgnore
    public void setPreparationDuration(Duration duration) {
        this.preparationTime = duration != null ? duration.toString() : null;
    }

    private List<UserDto> users;
    private List<RecipeIngredientDto> recipeIngredients;
    private List<CommentDto> comments;
}

