import model

def get_question(request):
    if (request.args and request.args.get("q-num")):
        q_num = request.args.get("q-num") or 0
    else:
        q_num = 1

    return model.get_question(q_num)


def get_next_qid(request):
    if (request.form and request.form["q_num"]):
        q_id = int(request.form["q_num"]) + 1
        next_q = model.get_question(q_id)
        if (next_q["q_num"]):
            print "found the next q"
            return q_id

    return 0
