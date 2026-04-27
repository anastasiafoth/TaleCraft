from models import db, User, Child
from datetime import datetime

class ChildManager:
    @staticmethod
    def get_all_children(parent_id):
        all_children = Child.query.filter_by(parent_id=parent_id).order_by(Child.id).all()

        # serialize objects
        children_list = []
        for child in all_children:
            child_dict = {
                "child_id": child.id,
                "first_name": child.first_name,
                "birthdate": child.birthdate,
                "profile_img": child.profile_img
            }
            children_list.append(child_dict)

        return children_list

    @staticmethod
    def create_child(parent_id, first_name, birthdate, profile_img):
        # get User from DB for role checking
        user = db.session.get(User, parent_id)

        if not user:
            raise ValueError("Parent does not exists.")

        if user.role != "Parent":
            raise PermissionError("Only Parents can create children profiles.")

        if not first_name:
            raise ValueError("Please enter a first name.")
        if not birthdate:
            raise ValueError("Please enter a birthdate.")

        # String is converted to datetime obj
        birthdate_obj = datetime.strptime(birthdate, "%Y-%m-%d").date()

        new_child = Child(
            parent_id=user.id,
            first_name=first_name,
            birthdate=birthdate_obj,
            profile_img=profile_img
        )

        db.session.add(new_child)
        db.session.commit()

        return {
                "child_id": new_child.id,
                "first_name" : new_child.first_name,
                "birthdate": new_child.birthdate,
                "profile_img" : new_child.profile_img
                }

    @staticmethod
    def get_child(child_id, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()
        if not child:
            raise ValueError("Child not found or not authorized")
        return {
            "child_id": child.id,
            "first_name" : child.first_name,
            "birthdate": child.birthdate,
            "profile_img" : child.profile_img
        }

    @staticmethod
    def update_child(child_id, data, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        if "first_name" in data:
            new_name = data["first_name"]
            if new_name == "":
                raise ValueError("Please enter a name.")
            child.first_name = data["first_name"]

        if "profile_img" in data:
            child.profile_img = data["profile_img"]

        if "birthdate" in data:
            birthdate_obj = datetime.strptime(data["birthdate"], "%Y-%m-%d").date()
            child.birthdate = birthdate_obj

        db.session.commit()

        return {
            "child_id": child.id,
            "first_name": child.first_name,
            "birthdate": child.birthdate,
            "profile_img": child.profile_img
        }

    @staticmethod
    def delete_child(child_id, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        db.session.delete(child)
        db.session.commit()

        return {"message": "Child deleted successfully"}
