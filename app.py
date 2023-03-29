import hashlib
import math
from flask import Flask, render_template, request, jsonify, session, make_response 
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import datetime
from functools import wraps
from bson.objectid import ObjectId
from gridfs import GridFS

app = Flask(__name__)

from pymongo import MongoClient

client = MongoClient('mongodb+srv://sparta:test@cluster0.9cacroc.mongodb.net/?retryWrites=true&w=majority')

db = client.dbsparta

comments_collection = db['newComments']
collection = db['movemarket']
users_collection = db['muser']

jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = 'Your_Secret_Key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)
page_size =10

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/search", methods=["POST"])
def search_get():
    searchValue = request.form['search_value']
    page_num = int(request.args.get('page', 1))
    skip = (page_num - 1 ) * page_size
    documents = collection.find({"주소(도로명)": {"$regex": searchValue, "$options": "i"}}, {"_id": 1, "주소(도로명)": 1}).skip(skip).limit(page_size)

    dataRespone = []
    for doc in documents:
        doc['_id'] = str(doc['_id'])
        dataRespone.append(doc)

    total_records=collection.count_documents({"주소(도로명)": {"$regex": searchValue, "$options": "i"}})
    
    total_pages = math.ceil(total_records / page_size)
    print(total_pages)
    return jsonify({'dataResponse': dataRespone, 'total_pages': total_pages})

@app.route("/details/<idResult>")
def details_page(idResult):
   
    return render_template('home.html', idResult=idResult)

@app.route("/register", methods=["POST"])
def register():
    userEmail = request.form.get('userEmail')
    userId = request.form.get('userId')
    userPwd = request.form.get('userPwd')
    userAddr = request.form.get('userAddr')
    userLevel = request.form.get('userLevel')
    # 복호화 비밀번호 digest(바이트 문자열) 또는 hexdigest(바이트 -> 16진수 문자열)  - 해싱코드 문자열 리턴
    userPwd_hash = hashlib.sha256(userPwd.encode('utf-8')).hexdigest()

    file = request.files['file']
    file.save('static/imgs/' + file.filename)

    doc = users_collection.find_one({"userEmail": userEmail})
    doc2 = {

       'userEmail':userEmail,
       'userId':userId,
       'userPwd' : userPwd_hash,
       'userAddr' : userAddr,
       'userProfile' : file.filename,
       'userLevel' : userLevel
       
    }
    if not doc:
        users_collection.insert_one(doc2)
        return jsonify({'msg': '회원가입 성공했습니다.'}), 201
    else:
        return jsonify({'msg': '이미 존재하는 이메일 입니다'}), 409

@app.route("/market", methods=['POST'])
def all_market():
    rptVal = request.form['rbt_give']
    data = collection.find({"MRKTTYPE": rptVal},
                           {"_id": 1, "MRKTNAME": 1, "MRKTTYPE": 1, "MRKTADDR1": 1})
    data_Array = []
    for doc in data:
        doc['_id'] = str(doc['_id'])
        data_Array.append(doc)

    return jsonify({'result': data_Array})

@app.route("/market/mapClick", methods=["POST"])
def market_mapClick():
    cityNm = request.form['cityNm_give']
    rptVal = request.form['rbt_give']

    data = collection.find({"MRKTADDR1": {"$regex": cityNm, "$options": "i"}, "MRKTTYPE": rptVal},
                           {"_id": 1, "MRKTNAME": 1, "MRKTTYPE": 1, "MRKTADDR1": 1})

    data_Array = []
    for doc in data:
        doc['_id'] = str(doc['_id'])
        data_Array.append(doc)

    return jsonify({'result': data_Array})

@app.route("/market/searchList", methods=["POST"])
def market_searchList():
    searchToggle = request.form['searchToggle_give']
    searchTxt = request.form['searchTxt_give']
    searchRbt = request.form['searchRbt_give']
    data_Array = []
    print(searchToggle)
    if (searchToggle == "1"):
        data = collection.find(
            {"MRKTNAME": {"$regex": searchTxt, "$options": "i"}, "MRKTTYPE": searchRbt},
            {"_id": 1, "MRKTNAME": 1, "MRKTTYPE": 1, "MRKTADDR1": 1})
        for doc in data:
            doc['_id'] = str(doc['_id'])
            data_Array.append(doc)
    elif (searchToggle == "2"):
        data = collection.find(
            {"MRKTADDR1": {"$regex": searchTxt, "$options": "i"}, "MRKTTYPE": searchRbt},
            {"_id": 1, "MRKTNAME": 1, "MRKTTYPE": 1, "MRKTADDR1": 1})
        for doc in data:
            doc['_id'] = str(doc['_id'])
            data_Array.append(doc)
    elif (searchToggle == "3"):
        data = collection.find(
            {"MRKTADDR2": {"$regex": searchTxt, "$options": "i"}, "MRKTTYPE": searchRbt},
            {"_id": 1, "MRKTNAME": 1, "MRKTTYPE": 1, "MRKTADDR2": 1})
        for doc in data:
            doc['_id'] = str(doc['_id'])
            data_Array.append(doc)

    return jsonify({'result': data_Array})


@app.route("/login", methods=["POST"])
def login():
    loginEmail = request.form.get('loginEmail')

    loginPassword = request.form.get('loginPassword')  # store the json body request
    # search for user in database
    user_from_db = users_collection.find_one({'userEmail': loginEmail})

    print(user_from_db)
    if user_from_db:
        encrpted_password = hashlib.sha256(
            loginPassword.encode("utf-8")).hexdigest()
        if encrpted_password == user_from_db['userPwd']:
            additional_claims = {
                
                'userEmail': user_from_db['userEmail'],
                'userLevel': user_from_db['userLevel']

            }
            access_token = create_access_token(identity=user_from_db['userId'], additional_claims=additional_claims)  # create access token
            refresh_token = create_refresh_token(identity=user_from_db['userId'], additional_claims=additional_claims)  # create refresh token

            return jsonify(access_token=access_token, refresh_token=refresh_token), 200

    return jsonify({'msg': 'The userName or password is incorrect'}), 401

@app.route("/api/v1/token/refresh", methods=["POST"])
#refresh_jwt_required / version not available
def refresh():
	current_user = get_jwt_identity() # Get the identity of the current user
	access_token = create_access_token(identity=current_user)
	return jsonify(access_token=access_token), 200

# X
@app.route("/api/v1/user", methods=["GET"])
@jwt_required
def profile():
	current_user = get_jwt_identity() # Get the identity of the current user
	user_from_db = users_collection.find_one({'username' : current_user})
	if user_from_db:
		del user_from_db['_id'], user_from_db['password'] # delete data we don't want to return
		return jsonify({'profile' : user_from_db }), 200
	else:
		return jsonify({'msg': 'Profile not found'}), 404

@app.route("/comment", methods=["POST"])
def comment_post():
    commentTitle = request.form["commentTitle"]
    comment_details = request.form["comment_details"]
    idResult = request.form["idResult"]
    # post_from_db = collection.find_one({'_id': idResult})
    doc = {
        'parentId': idResult,
        'commentTitle': commentTitle,
        'comment_details': comment_details
    }
    comments_collection.insert_one(doc)
    commentId = comments_collection.find_one(doc)
    collection.insert_one({'commentId': commentId["_id"]})
    return jsonify({'msg': '응원 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)