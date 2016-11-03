CREATE TABLE IF NOT EXISTS answers (
    ans_id INT NOT NULL AUTO_INCREMENT,
    q_num INT,
    company VARCHAR(128),
    answer INT,
    addl_text TEXT,
    ip_address VARCHAR(64),
    PRIMARY KEY(ans_id)
);


CREATE TABLE IF NOT EXISTS questions (
    q_id INT NOT NULL AUTO_INCREMENT,
    q_num INT,
    q_text TEXT,
    answer_option VARCHAR(512),
    PRIMARY KEY(q_id)
);
