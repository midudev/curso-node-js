import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
    host: "localhost",
    user: "root",
    port: 3306,
    password: "",
    database: "moviesdb",
};
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);

export class MovieModel {
    static async getAll({ genre }) {
        console.log("getAll");

        if (genre) {
            const lowerCaseGenre = genre.toLowerCase();

            // get genre ids from database table using genre names
            const [genres] = await connection.query(
                "SELECT id, name FROM genre WHERE LOWER(name) = ?;",
                [lowerCaseGenre]
            );

            // no genre found
            if (genres.length === 0) return [];

            // get the id from the first genre result
            const [{ id }] = genres;

            // get all movies ids from database table
            // la query a movie_genres
            // join
            // y devolver resultados..
            return [];
        }

        const [movies] = await connection.query(
            "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie;"
        );

        return movies;
    }

    static async getById({ id }) {
        const [movies] = await connection.query(
            `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
        FROM movie WHERE id = UUID_TO_BIN(?);`,
            [id]
        );

        if (movies.length === 0) return null;

        return movies[0];
    }

    static async create({ input }) {
        const {
            genre, // genre is an array
            title,
            year,
            duration,
            director,
            rate,
            poster,
        } = input;

        // todo: crear la conexión de genre
        const genres = genre.reduce((genres, g, i, array) => {
            // se comprueba el indice para no agregar una coma despues del ultimo elemento
            genres += `"${g}"${i === array.length - 1 ? "" : ","}`;
            // convierto a lowerCase para evitar problemas de comparacion
            return genres.toLowerCase();
        }, "");

        // crypto.randomUUID()
        const [uuidResult] = await connection.query("SELECT UUID() uuid;");
        const [{ uuid }] = uuidResult;

        // get genres ids

        try {
            await connection.query(
                `INSERT INTO movie (id, title, year, director, duration, poster, rate)
          VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
                [title, year, director, duration, poster, rate]
            );
        } catch (e) {
            // puede enviarle información sensible
            throw new Error("Error creating movie");
            // enviar la traza a un servicio interno
            // sendLog(e)
        }

        const [genresIdResult] = await connection.query(`
          SELECT id FROM genre WHERE name in(${genres})
        `);

        const movies_genres = genresIdResult.reduce(
            // usamos destructuring en el id porque viene como objeto
            (movies_genres, { id }, i, array) => {
                // se comprueba el indice para no agregar una coma despues del ultimo elemento
                movies_genres += `(UUID_TO_BIN('${uuid}'),${id})${
                    i === array.length - 1 ? ";" : ", "
                }`;
                // convierto a lowerCase para evitar problemas de comparacion
                return movies_genres;
            },
            ""
        );
        try {
            await connection.query(
                `
            INSERT INTO movies_genres (movie_id, genre_id) VALUES ${movies_genres}
        `
            );
        } catch (e) {
            // puede enviarle información sensible
            throw new Error("Error adding genres");
            // enviar la traza a un servicio interno
            // sendLog(e)
        }

        const [movies] = await connection.query(
            `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
        FROM movie WHERE id = UUID_TO_BIN(?);`,
            [uuid]
        );

        return movies[0];
    }

    static async delete({ id }) {
        // ejercio fácil: crear el delete
    }

    static async update({ id, input }) {
        // ejercicio fácil: crear el update
    }
}
