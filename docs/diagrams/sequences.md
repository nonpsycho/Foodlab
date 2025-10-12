# 📊 Диаграммы последовательностей

### 1. Авторизация и регистрация
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Users as UserController
    participant UserService as UserService
    participant UserRepo as UserRepository
    participant Auth as AuthService

    User->>Frontend: Открывает экран Вход
    Frontend->>Users: POST /api/users/login {username, password}
    activate Users
    Users->>Auth: authenticate(username, password)
    activate Auth
    Auth->>UserRepo: findByUsername(username)
    UserRepo-->>Auth: User or null
    alt Пароль верен
        Auth-->>Users: 200 OK + userInfo
    else Ошибка
        Auth-->>Users: 401 Unauthorized
    end
    deactivate Auth
    Users-->>Frontend: Ответ логина
    deactivate Users
    Frontend->>User: Вход успешен или ошибка

    User->>Frontend: Открывает экран Регистрация
    Frontend->>Users: POST /api/users {username, email, password}
    activate Users
    Users->>UserService: register(dto)
    activate UserService
    UserService-->>UserService: валидация, уникальность
    UserService->>UserRepo: save(new User)
    UserRepo-->>UserService: User c id
    UserService-->>Users: 201 Created + userInfo
    deactivate UserService
    Users-->>Frontend: 201 Created + userInfo
    deactivate Users
    Frontend->>User: Регистрация успешна и вход в систему
```

### 2. Загрузка данных
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Recipes as RecipeController
    participant Ingredients as IngredientController
    participant Comments as CommentController
    participant RecipeService as RecipeService
    participant IngredientService as IngredientService
    participant CommentService as CommentService
    participant RecipeRepo as RecipeRepository
    participant IngredientRepo as IngredientRepository
    participant CommentRepo as CommentRepository
    participant SavesRepo as RecipeUserSavesRepository
    participant RecipeIngrRepo as RecipeIngredientRepository

    User->>Frontend: Открывает приложение
    Frontend->>Recipes: GET /api/recipes
    Recipes->>RecipeService: findAll()
    RecipeService->>RecipeRepo: findAll()
    RecipeRepo-->>RecipeService: Список рецептов
    RecipeService-->>Recipes: Список рецептов
    Recipes-->>Frontend: Список рецептов

    Frontend->>Comments: GET /api/comments
    Comments->>CommentService: findAll()
    CommentService->>CommentRepo: findAll()
    CommentRepo-->>CommentService: Список комментариев
    CommentService-->>Comments: Список комментариев
    Comments-->>Frontend: Список комментариев

    Frontend->>Ingredients: GET /api/ingredients
    Ingredients->>IngredientService: findAll()
    IngredientService->>IngredientRepo: findAll()
    IngredientRepo-->>IngredientService: Справочник ингредиентов
    IngredientService-->>Ingredients: Справочник ингредиентов
    Ingredients-->>Frontend: Справочник ингредиентов

    opt Для каждой карточки рецепта
        Frontend->>Recipes: GET /api/recipes/:id/ingredients
        Recipes->>RecipeService: getIngredients(recipeId)
        RecipeService->>RecipeIngrRepo: findByRecipeId(recipeId)
        RecipeIngrRepo-->>RecipeService: Состав рецепта
        RecipeService-->>Recipes: Состав рецепта
        Recipes-->>Frontend: Состав рецепта

        Frontend->>Recipes: GET /api/recipes/:id/users
        Recipes->>RecipeService: getSavedUsers(recipeId)
        RecipeService->>SavesRepo: findUsersByRecipeId(recipeId)
        SavesRepo-->>RecipeService: Пользователи сохранившие рецепт
        RecipeService-->>Recipes: Пользователи сохранившие рецепт
        Recipes-->>Frontend: Пользователи сохранившие рецепт
    end

    Frontend->>User: Отображает список рецептов, состав и комментарии
```

### 3. Добавление рецепта
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Recipes as RecipeController
    participant Ingredients as IngredientController
    participant RecipeService as RecipeService
    participant IngredientService as IngredientService
    participant RecipeRepo as RecipeRepository
    participant RecipeIngrRepo as RecipeIngredientRepository
    participant IngredientRepo as IngredientRepository

    User->>Frontend: Заполняет форму рецепта
    Frontend->>Recipes: POST /api/recipes {name, preparationTime, recipeIngredients}
    activate Recipes

    Recipes->>RecipeService: createRecipe(dto)
    activate RecipeService

    alt Проверка и создание недостающих ингредиентов
        loop Для каждого элемента recipeIngredients
            RecipeService->>IngredientService: ensureExistsByIdOrName(ingredientRef)
            activate IngredientService
            alt Ингредиент существует
                IngredientService-->>RecipeService: Ingredient
            else Ингредиента нет
                IngredientService->>IngredientRepo: save(new Ingredient)
                IngredientRepo-->>IngredientService: Ingredient c id
                IngredientService-->>RecipeService: Ingredient
            end
            deactivate IngredientService
        end
    end

    RecipeService->>RecipeRepo: save(new Recipe)
    RecipeRepo-->>RecipeService: Recipe c id

    loop Привязка ингредиентов к рецепту
        RecipeService->>RecipeIngrRepo: save(new RecipeIngredient(recipeId, ingredientId, grams))
        RecipeIngrRepo-->>RecipeService: RecipeIngredient c id
    end

    RecipeService-->>Recipes: 201 Created + Recipe
    deactivate RecipeService

    Recipes-->>Frontend: 201 Created + Recipe
    deactivate Recipes

    Frontend->>Recipes: GET /api/recipes
    Recipes->>RecipeService: findAll()
    RecipeService->>RecipeRepo: findAll()
    RecipeRepo-->>RecipeService: Список рецептов
    RecipeService-->>Recipes: Список рецептов
    Recipes-->>Frontend: Список рецептов

    Frontend->>User: Показ успешного добавления и обновлённый список
```

### 4. Редактирование рецепта
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Recipes as RecipeController
    participant RecipeService as RecipeService
    participant IngredientService as IngredientService
    participant RecipeRepo as RecipeRepository
    participant RecipeIngrRepo as RecipeIngredientRepository
    participant IngredientRepo as IngredientRepository

    User->>Frontend: Открывает форму редактирования
    Frontend->>Recipes: PUT /api/recipes/:id {name, preparationTime, recipeIngredients}
    activate Recipes
    Recipes->>RecipeService: updateRecipe(id, dto)
    activate RecipeService

    alt Проверка и обеспечение ингредиентов
        loop Для каждого элемента recipeIngredients
            RecipeService->>IngredientService: ensureExistsByIdOrName(ref)
            activate IngredientService
            alt Ингредиент существует
                IngredientService-->>RecipeService: Ingredient
            else Ингредиента нет
                IngredientService->>IngredientRepo: save(new Ingredient)
                IngredientRepo-->>IngredientService: Ingredient c id
                IngredientService-->>RecipeService: Ingredient
            end
            deactivate IngredientService
        end
    end

    RecipeService->>RecipeRepo: save(updated Recipe)
    RecipeRepo-->>RecipeService: Recipe

    par Пересобрать связи ингредиентов
        RecipeService->>RecipeIngrRepo: deleteByRecipeId(id)
        loop Вставка новой связки
            RecipeService->>RecipeIngrRepo: save(RecipeIngredient)
            RecipeIngrRepo-->>RecipeService: RecipeIngredient
        end
    end

    RecipeService-->>Recipes: 200 OK + Recipe
    deactivate RecipeService
    Recipes-->>Frontend: 200 OK + Recipe
    deactivate Recipes
    Frontend->>User: Показ успешного обновления
```

### 5. Удаление рецепта
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Recipes as RecipeController
    participant RecipeService as RecipeService
    participant RecipeRepo as RecipeRepository
    participant RecipeIngrRepo as RecipeIngredientRepository
    participant SavesRepo as RecipeUserSavesRepository
    participant CommentRepo as CommentRepository

    User->>Frontend: Нажимает Удалить рецепт
    Frontend->>Recipes: DELETE /api/recipes/:id
    Recipes->>RecipeService: deleteRecipe(id, principal)

    alt Есть права (владелец или админ)
        par Очистка зависимостей
            RecipeService->>RecipeIngrRepo: deleteByRecipeId(id)
            RecipeService->>SavesRepo: deleteByRecipeId(id)
            RecipeService->>CommentRepo: deleteByRecipeId(id)
        end
        RecipeService->>RecipeRepo: deleteById(id)
        RecipeRepo-->>RecipeService: OK
        RecipeService-->>Recipes: 204 No Content
        Recipes-->>Frontend: 204 No Content
        Frontend->>User: Карточка удалена из списка
    else Нет прав
        RecipeService-->>Recipes: 403 Forbidden
        Recipes-->>Frontend: 403 Forbidden
        Frontend->>User: Показ отказа
    end
```

### 6. Создание ингредиента
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Ingredients as IngredientController
    participant IngredientService as IngredientService
    participant IngredientRepo as IngredientRepository

    User->>Frontend: Открывает диалог Создать ингредиент
    Frontend->>Ingredients: POST /api/ingredients {name, proteins, fats, carbohydrates}
    activate Ingredients
    Ingredients->>IngredientService: create(dto)
    activate IngredientService
    IngredientService-->>IngredientService: валидация name и макро
    IngredientService->>IngredientRepo: save(Ingredient)
    IngredientRepo-->>IngredientService: Ingredient c id
    IngredientService-->>Ingredients: 201 Created + Ingredient
    deactivate IngredientService
    Ingredients-->>Frontend: 201 Created + Ingredient
    deactivate Ingredients
    Frontend->>User: Ингредиент добавлен и доступен в списке
```

### 7. Сохранение или удаление рецепта из избранного
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Recipes as RecipeController
    participant RecipeService as RecipeService
    participant SavesRepo as RecipeUserSavesRepository

    User->>Frontend: Нажимает сохранить или удалить из сохранённых
    alt Рецепт не сохранён
        Frontend->>Recipes: POST /api/recipes/:id/users/:userId
        activate Recipes
        Recipes->>RecipeService: saveForUser(recipeId, userId)
        activate RecipeService
        RecipeService->>SavesRepo: addMapping(recipeId, userId)
        SavesRepo-->>RecipeService: OK
        RecipeService-->>Recipes: OK
        deactivate RecipeService
        Recipes-->>Frontend: 200 OK
        deactivate Recipes
    else Рецепт уже сохранён
        Frontend->>Recipes: DELETE /api/recipes/:id/users/:userId
        activate Recipes
        Recipes->>RecipeService: removeForUser(recipeId, userId)
        activate RecipeService
        RecipeService->>SavesRepo: removeMapping(recipeId, userId)
        SavesRepo-->>RecipeService: OK
        RecipeService-->>Recipes: OK
        deactivate RecipeService
        Recipes-->>Frontend: 204 No Content
        deactivate Recipes
    end

    opt Обновление счётчика и состояния
        Frontend->>Recipes: GET /api/recipes/:id/users
        Recipes->>RecipeService: getSavedUsers(recipeId)
        RecipeService->>SavesRepo: findUsersByRecipeId(recipeId)
        SavesRepo-->>RecipeService: Пользователи сохранившие рецепт
        RecipeService-->>Recipes: Пользователи сохранившие рецепт
        Recipes-->>Frontend: Пользователи сохранившие рецепт
    end

    Frontend->>User: Обновлённый статус и счётчик сохранений
```

### 8. Комментирование
```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Frontend as Frontend
    participant Comments as CommentController
    participant CommentService as CommentService
    participant CommentRepo as CommentRepository

    %% Добавление
    User->>Frontend: Пишет комментарий
    Frontend->>Comments: POST /api/comments {text, userId, recipeId}
    Comments->>CommentService: create(dto)
    CommentService->>CommentRepo: save(Comment)
    CommentRepo-->>CommentService: Comment с id
    CommentService-->>Comments: 201 Created + Comment
    Comments-->>Frontend: 201 Created + Comment

    %% Редактирование
    User->>Frontend: Редактирует свой комментарий
    Frontend->>Comments: PUT /api/comments/:id {text}
    Comments->>CommentService: update(id, dto, principal)
    alt Автор или админ
        CommentService->>CommentRepo: save(updated Comment)
        CommentRepo-->>CommentService: Comment
        CommentService-->>Comments: 200 OK + Comment
    else Нет прав
        CommentService-->>Comments: 403 Forbidden
    end
    Comments-->>Frontend: Ответ сервера

    %% Удаление
    User->>Frontend: Удаляет свой комментарий
    Frontend->>Comments: DELETE /api/comments/:id
    Comments->>CommentService: delete(id, principal)
    alt Автор или админ
        CommentService->>CommentRepo: deleteById(id)
        CommentRepo-->>CommentService: OK
        CommentService-->>Comments: 204 No Content
    else Нет прав
        CommentService-->>Comments: 403 Forbidden
    end
    Comments-->>Frontend: Ответ сервера
```
