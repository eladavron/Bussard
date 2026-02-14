# Codename "Bussard"

<img src="src/assets/Bussard.svg" alt="Project Bussard's logo - the Bussard Collector of a Constitution Class starship" width="150" align="right"/>

A self-hosted [free and open source](https://en.wikipedia.org/wiki/Free_and_open-source_software) physical collection management software.

"Bussard" is a temporary code-name, named after the "[Bussard Collectors](https://memory-alpha.fandom.com/wiki/Bussard_collector)" at the front of Star Trek federation ship warp nacelles.

Logo created by [Noel Rupenthal](https://ca.linkedin.com/in/noel-ruppenthal-4217628).

## Features

<img width="1870" height="862" alt="image" src="https://github.com/user-attachments/assets/67fa2aca-583d-4eba-b24c-f53e6bae098c" />
<img width="1892" height="1020" alt="image" src="https://github.com/user-attachments/assets/2bb8f1bd-4d1b-4471-ace9-8914cbe31904" />


- Add movies by title or barcode, with metadata automatically fetched from the OMDB API
- Manage which formats you own (DVD, Blu-Ray, 4K UHD, etc.) and which regions they are compatible with
- Search and filter your collection by title, format, region, etc.
- Edit metadata manually (title, year, format, region, etc.)
- Backup and restore your collection data
- Select a poster image for each movie, either from the OMDB API or by uploading your own

## Deployment

Create a `.env` file with your desired settings (you can use the `.env.example` file as a template), then run the following command:

```bash
docker-compose up -d
```

Also if you care about SSL, make sure to change the paths to your SSL certificate and private key in `docker-compose.yml`.  
Note that the barcode scanner will not work on mobile phones without SSL, everything else should work fine.

## Development

These are all *recommended* settings if you want to contribute to the project.  
You don't *need* to follow those, but that's what I used.

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
    BARCODE_LOOKUP_API_KEY=your_barcode_lookup_api_key_here
    ```

    Replace `changeme` with a strong password, `your_omdb_api_key_here` with your actual [OMDB API](https://www.omdbapi.com/) key, and `your_barcode_lookup_api_key_here` with your actual [Barcode Lookup API](https://barcodelookup.com/) key.

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
