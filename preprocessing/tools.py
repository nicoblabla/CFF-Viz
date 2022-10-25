import json

def obj_dict(obj):
    return obj.__dict__

def save_to_json(filename: str, obj):
    with open(filename, "w") as outfile:
        outfile.write(json.dumps(obj, default=obj_dict, ensure_ascii=False))
