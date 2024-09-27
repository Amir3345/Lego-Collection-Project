# Lego Collection Project

Welcome to the **Lego Collection Project**! This project is a web application designed to showcase a collection of LEGO sets. Users can explore various LEGO themes, view details about specific sets, and even add new sets to the collection.

You can visit the live site [here](https://web-322-livid-nine.vercel.app/).

## Project Overview

The **Lego Collection Project** allows users to:
- View a homepage with a welcoming introduction to the LEGO collection.
- Browse various LEGO themes and sets.
- View details of individual LEGO sets by theme or set number.
- Add, edit, and delete LEGO sets (authenticated users only).
- Register, log in, and view user login history (for authenticated users).

## Technologies and Languages Used

This project was built using the following technologies:

- **Node.js**: JavaScript runtime for backend development.
- **Express.js**: Web framework used for routing and middleware management.
- **EJS (Embedded JavaScript)**: Templating engine for dynamic HTML rendering.
- **MongoDB**: NoSQL database for storing LEGO sets and user information.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB, making database interactions more straightforward.
- **PostgreSQL**: Relational database management system also used for data storage (for specific tasks).
- **Sequelize**: ORM (Object-Relational Mapping) tool to interact with PostgreSQL.
- **Client-Sessions**: Used for session management to keep users logged in.
- **CSS Framework**: Tailwind CSS or custom CSS (depending on your styling preferences).
- **Vercel**: Deployment platform used to host the live project.

## Key Features

- **Authentication**: Users can register, log in, and log out. Login sessions are managed using `client-sessions`.
- **CRUD Operations**: Users (authenticated) can create, read, update, and delete LEGO sets.
- **Theme Filtering**: Browse LEGO sets by specific themes.
- **Error Handling**: Custom 404 and 500 error pages are included for better user experience.
  
## How to Run the Project Locally

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
   Create a `.env` file with the following variables:
    ```
    PGDATABASE=yourDatabase
    PGUSER=yourDatabaseUser
    PGPASSWORD=yourDatabasePassword
    PGHOST=yourDatabaseHost
    MONGO_URI=yourMongoDBConnectionString
    SESSION_SECRET=yourSessionSecret
    ```

4. **Start the server**:
    ```bash
    npm start
    ```

5. **Open your browser** and navigate to `http://localhost:3000`.

## Live Website

You can access the live version of the project [here](https://web-322-livid-nine.vercel.app/).

## Future Enhancements

- Add user roles to limit access to certain features (e.g., only admins can delete sets).
- Improve search functionality for LEGO sets by set number or keyword.
- Implement better error handling and logging for production environments.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
