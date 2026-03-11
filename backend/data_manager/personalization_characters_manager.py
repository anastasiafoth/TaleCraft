from models import db, Personalization, PersonalizationCharacters

class PersonalizationCharactersManager:
    @staticmethod
    def get_all_personalization_characters(personalization_id, parent_id):
        characters = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.personalization_id == personalization_id,
                Personalization.parent_id == parent_id
            ).all()

        result = []

        for c in characters:
            result.append({
                "id": c.id,
                "personalization_id": c.personalization_id,
                "role": c.role,
                "name": c.name,
                "gender": c.gender,
                "main_color": c.main_color,
                "hair_color": c.hair_color,
                "clothing": c.clothing,
                "glasses": c.glasses,
                "extra_attributes": c.extra_attributes,
                "customizable": c.customizable
            })

        return result

    @staticmethod
    def get_personalization_character(character_id, parent_id):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }

    @staticmethod
    def update_personalization_character(character_id, parent_id, data):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        if "name" in data:
            character.name = data["name"]

        if "gender" in data:
            character.gender = data["gender"]

        if "main_color" in data:
            character.main_color = data["main_color"]

        if "hair_color" in data:
            character.hair_color = data["hair_color"]

        if "clothing" in data:
            character.clothing = data["clothing"]

        if "glasses" in data:
            character.glasses = data["glasses"]

        if "extra_attributes" in data:
            character.extra_attributes = data["extra_attributes"]

        db.session.commit()

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }

    @staticmethod
    def delete_personalization_character(character_id, parent_id):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        db.session.delete(character)
        db.session.commit()

        return True

    @staticmethod
    def reset_character(character_id, parent_id):
        character = (
            PersonalizationCharacters.query
            .join(Personalization)
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            )
            .first()
        )

        if not character:
            raise ValueError("Character not found")

        template = character.template

        # existing character Obj is reset with values from the template
        character.role = template.role
        character.name = template.default_name
        character.gender = template.default_gender
        character.main_color = template.default_main_color
        character.hair_color = template.default_hair_color
        character.clothing = template.default_clothing
        character.glasses = template.default_glasses
        character.extra_attributes = template.extra_attributes
        character.customizable = template.customizable

        db.session.commit()

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }