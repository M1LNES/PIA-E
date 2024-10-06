CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255),
    permission SMALLINT
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    role SMALLINT REFERENCES Roles(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);


CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE Posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author INTEGER REFERENCES Users(id),
    category INTEGER REFERENCES Category(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE ThreadComments (
    id SERIAL PRIMARY KEY,
    author INTEGER REFERENCES Users(id),
    post INTEGER REFERENCES Posts(id),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE Reaction (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    icon VARCHAR(255)
);

CREATE TABLE PostReactions_M_N (
    id SERIAL PRIMARY KEY,
    author INTEGER REFERENCES Users(id),
    post INTEGER REFERENCES Posts(id),
    reaction INTEGER REFERENCES Reaction(id)
);
