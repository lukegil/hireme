import model

def add_answer(request):

    f = request.form
    ip = request.remote_addr
    fields = {
        "q_num" : int(f["q_num"]),
        "company" : f["company"],
        "answer" : f["answer"],
        "addl_text" : f["addl_text"],
        "ip_address" : ip
    }

    model.insert_answer(fields)

    # assuming a successful insert for now
    return True
