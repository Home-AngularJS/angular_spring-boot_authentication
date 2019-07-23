# Часть 1. Клиент на Angular

## Команды из package.json

```
# npm install
# yarn start // запускает ng serve

# yarn prod // делает сборку проекта в production с base-ref /app
# yarn deploy // деплоит проект в локальную папку ~/Sites/app
```

## Клиент использующий сервер аутентифкикации

Структура проекта:

    .
    ├── auth                                # Модуль аутентификации
    │   ├── actions
    │   │   └── auth.ts
    │   ├── auth-routing.module.ts
    │   ├── auth.module.ts
    │   ├── components
    │   │   ├── signin.component.ts
    │   │   └── signup.component.ts
    │   ├── containers
    │   │   ├── signin-page.component.ts
    │   │   └── signup-page.component.ts
    │   └── services
    │       └── auth.service.ts
    └── core                                # Главный модуль
        ├── components
        │   └── index.component.ts
        ├── containers
        │   ├── app.component.ts
        │   └── not-found-page.ts
        ├── core-routing.module.ts
        ├── core.module.ts
        ├── models
        │   ├── answer-message.ts
        │   ├── answer.ts                   # Ответ с сервера
        │   ├── notify-type.enum.ts
        │   ├── ping-payload.ts             # Данные для отправки на сервер
        │   └── pong-payload.ts             # Данные для получения ответа с сервера
        ├── reducers
        │   └── reducer.reducer.ts
        └── services
            ├── cookies.service.ts
            ├── ping.service.ts             # Сервисе выполняющий запросы пользователя на сервер
            ├── security.service.ts         # Сервис, в котором реализовано обращение к ААА API сервера
            ├── services.module.ts
            └── utils.service.ts
    
  ## REST клиент для сервис аутентификации/авторизации/регистрации

Для коммуникации с сервером будем использовать обёртки для `@angular/common/http/HttpClient` со следующей иерархией:

    api-base
    ├── api-security.service
    └──── security.service 

В них мы имеем вызовы `API` сервера аутнетификации.

Далее, ответы от сервиса `security.service` передаются ниже по иерархии в сервис `auth.service` в нем сохраняется состояние пользователя в `Store` и `Cookies`. `Cookies` используются для восстановления состояния аутнетифицированного пользователя после перезагрузки страницы. И в случае ошибок они обрабатываются путем вывода сообщения в консоль и, затем, передаются вверх по иерархии.

Пример метода аутентификации:

```
authorize(credentials: UserCredentials): Observable<AuthUser | Failure> {
  return this.securityService.authorize(credentials) // Делаем HTTP запрос на сервер
    .pipe(
      tap(authUser => this.setAuthUserState(authUser)), // Сохраняем состояние пользователя
      catchError(error => { // Ловим ошибки
        return this.errorHandler.handleAuthError(error);
      })
    )
}
```

## Полезная нагрузка на сервер

Для отправки запросов на сервер используется обёртка к `HttpClient` - `ping.service`, в которой вызывается метод `ping` `API` сервера на Spring.

## Прерыватель запросов (api-interceptor)

Для отправки данных об аутентифицированном пользователе используются прерыватель HTTP запросов, который кладёт в заголовки AccessToken и UserSession.

Пример кода:

```
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return this.authService.getLoggedUser() // Берём текущего залогиненного пользователя
    .pipe(
      map(authUser => {
        // Добавляем данные в заголовки
        let clonedRequest = req.clone();
        let isLoggedIn = UtilsService.isLoggedIn(authUser);
        if (isLoggedIn) {
          clonedRequest = clonedRequest.clone(
            {
              headers:
                clonedRequest.headers
                  .append(AppConstants.ACCESS_TOKEN_HEADER, authUser.accessToken)
                  .append(AppConstants.USER_SESSION_HEADER, authUser.userSession)
            }
          );
        }
        return next.handle(clonedRequest);
      }),
      switchMap(value => {
        return value;
      }),
    );
}
```

# Схема взаимодействия с сервером

![Диаграмма последовательности взаимодействия с сервером](https://raw.githubusercontent.com/lynx-r/angular-spring-authentication-web-angular/master/sequence-diagram.png)

На диаграмм последовательностей (Sequence Diagram) "Диаграмма последовательности взаимодействия с сервером" изображён процесс выполнения запросов к серверу. После загрузки страницы, клиент отправляет запрос на аутентификацию (здесь рассмотрен случай с пройденной аутентификацией без ошибок). Далее, после получения этого запроса, сервер выдаёт токен. Нужно уточнить, что токен выдаётся не просто так, а после авторизации, которая для упрощения схемы не показана. Подробности по авторизации можно прочитать в смежной статье. Затем, после генерации токена на сервере, возвращается ответ клиенту. Клиент сохраняет этот токен и выполняет `ping` запрос к серверу. Сервер проверяет пришедший токен, обрабатывает данные `ping` запроса и генерирует новый токен. В нашем примере, он просто возвращает строку `"${data.getPing()} from ${authUser.getUsername()} and PONG from server"`. После получения ответа с сервера, клиент сохраняет токен и выполняет с этим новым токеном следующий запрос.

Если токен потеряется или клиент его не правильно сохранит, то этот и следующие запросы не пройдут до тех пор, пока пользователь не авторизуется повторно.
