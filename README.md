# Codename "Bussard"

<img src="src/assets/Bussard.svg" alt="Project Bussard's logo - the Bussard Collector of a Constitution Class starship" width="150" align="right"/>

A self-hosted [free and open source](https://en.wikipedia.org/wiki/Free_and_open-source_software) physical collection management software.

"Bussard" is a temporary code-name, named after the "[Bussard Collectors](https://memory-alpha.fandom.com/wiki/Bussard_collector)" at the front of Star Trek federation ship warp nacelles. 

Logo created by [Noel Rupenthal](https://ca.linkedin.com/in/noel-ruppenthal-4217628).

## Deployment

Simply run `docker-compose up -d` in the root directory to start the application and its dependencies. The application will be available at `http://localhost:3000`.

## Development

These are all *recommended* settings, you don't *need* to follow those, but that's what I used.

### Prerequisites

1. Linux (or WSL) with:
    1. Node 22.0 or above with NPM (install with [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating))
    1. Docker (see [this guide](https://daniel.es/blog/how-to-install-docker-in-wsl-without-docker-desktop/) for installation in WSL)
1. VSCode with a ProstegeSQL extension

### ProstegeSQL

> [!IMPORTANT]
> Replace `changeme` with a strong password and replace all instances of it below!  
  For local development, avoid special characters (like `@` or `?`) to prevent connection string encoding issues.

To configure ProstegeSQL, follow these steps:

1. Create a `.env` file in the root directory with the following content:

    ```env
    POSTGRES_USER=bussard_user
    POSTGRES_PASSWORD=changeme
    POSTGRES_DB=bussard_db
    OMDB_API_KEY=your_omdb_api_key_here
    ```

    Replace `changeme` with a strong password and `your_omdb_api_key_here` with your actual OMDB API key.

1. Run the database with:

    ```bash
    docker-compose up -d postgres
    ```

1. Connect to the database with the following settings:

    - Host: `localhost`
    - Port: `5432`
    - User: `bussard_user`
    - Password: The password from step 1
    - Database: `bussard_db`
    - SSL: `disable`

## Credits

- Bussard Collector Logo: [Noel Rupenthal](https://ca.linkedin.com/in/noel-ruppenthal-4217628)
- Movie Poster Placeholder: [Layerace](https://www.freepik.com/author/layerace) on Freepik