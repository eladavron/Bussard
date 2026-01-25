# Codename "Bussard"

A [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) collection library.

## Development

These are all *recommended* settings, you don't *need* to follow those, but that's what I used.

### Prerequisites

1. Linux (or WSL) with:
    1. Node 22.0 or above with NPM
    1. Docker (see [this guide](https://daniel.es/blog/how-to-install-docker-in-wsl-without-docker-desktop/) for installation in WSL)
1. VSCode with a ProstegeSQL extension

### ProstegeSQL

To configure ProstegeSQL, follow these steps:

1. Create a `.env` file in the root directory with the following content:

    ```env
    POSTGRES_USER=bussard_user
    POSTGRES_PASSWORD=changeme
    POSTGRES_DB=bussard_db
    ```

    > [!IMPORTANT]
    > Replace `changeme` with a strong password!  
    For local development, avoid special characters (like `@`) to prevent connection string encoding issues.

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
