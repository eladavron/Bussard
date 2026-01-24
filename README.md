# Codename "Bussard"

A [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) collection library.

## Development

These are all *recommended* settings, you don't *need* to follow those, but that's what I used.

### Prerequisites

1. Docker
1. Linux (or WSL)
1. VSCode with a ProstegeSQL extension

## ProstegeSQL

To configure ProstegeSQL, follow these steps:

1. Create a `.env` file in the root directory with the following content:

    ```env
    POSTGRES_USER=bussard_user
    POSTGRES_PASSWORD=changeme
    POSTGRES_DB=bussard_db
    ```

    > [!IMPORTANT]
    > Replace `changeme` with a strong password!

1. Run the database with:

    ```bash
    docker-compose up -d
    ```

1. Connect to the database with the following settings:

    - Host: `localhost`
    - Port: `5432`
    - User: `bussard_user`
    - Password: The password from step 1
    - Database: `bussard_db`
    - SSL: `disable`
