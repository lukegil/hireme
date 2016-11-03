import mysql.connector
from mysql.connector import errorcode
from ConfigParser import ConfigParser
from flask import current_app, g

def get_db():
    if not hasattr(g, "mysql_connection"):
        g.mysql_connection = connect_db()

    return g.mysql_connection


def connect_db():
    c = ConfigParser()
    c.read(current_app.local_paths["db_config"])

    if c.has_section("prod_connection"):
        section = "prod_connection"
    else:
        section = "local_connection"

    config = {
        "user" : c.get(section, "username"),
        "password" : c.get(section, "pw"),
        "host" : c.get(section, "host"),
        "database" : c.get(section, "database"),
    }

    try:
        cnx = mysql.connector.connect(**config)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)

    return cnx

def insert_answer(fields):
    c = ConfigParser()
    c.read(current_app.local_paths["db_config"])

    query = """ INSERT INTO {table}
                SET
                    q_num = %(q_num)s,
                    company = %(company)s,
                    answer = %(answer)s,
                    addl_text = %(addl_text)s,
                    ip_address = %(ip)s
                ;
            """.format(table = c.get("answer_table", "table_name"))

    args = {
                "q_num" : fields["q_num"],
                "company" : fields["company"],
                "answer" : fields["answer"],
                "addl_text" : fields["addl_text"],
                "ip" : fields["ip_address"],
            }

    cnx = get_db()
    cursor = cnx.cursor()
    cursor.execute(query, args)
    cnx.commit()
    cursor.close()

def get_question(q_num):
    q_obj = {
        "q_num" : 0,
        "q_text" : "",
        "answer_options" : []
    }

    c = ConfigParser()
    c.read(current_app.local_paths["db_config"])

    query = """ SELECT q_id,
                    q_num,
                    q_text,
                    answer_option
                FROM {table}
                WHERE q_num = %(q_num)s;
            """.format(table = c.get("question_table", "table_name"))

    args = {"q_num" : q_num}

    cnx = get_db()
    cursor = cnx.cursor()
    cursor.execute(query, args)
    for q_id, q_num, q_text, answer_option in cursor:
        q_obj["q_num"] = q_num
        q_obj["q_text"] = q_text
        q_obj["answer_options"].append({"key" : q_id, "text" : answer_option})

    cnx.commit()
    cursor.close()
    return q_obj
