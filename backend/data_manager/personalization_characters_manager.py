from models import db, Personalization, PersonalizationCharacters, BookCharacterTemplate

class PersonalizationCharactersManager:

    @staticmethod
    def _get_authorized_character(character_id, parent_id):
        """helper function: gets Character with authorization check."""
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        return character

    @staticmethod
    def get_all_personalization_characters(personalization_id, parent_id):
        characters = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.personalization_id == personalization_id,
                Personalization.parent_id == parent_id
            ).all()

        return [c.to_dict() for c in characters]

    @staticmethod
    def get_personalization_character(character_id, parent_id):
        character = PersonalizationCharactersManager._get_authorized_character(character_id, parent_id)
        return character.to_dict()

    @staticmethod
    def update_personalization_character(character_id, parent_id, data):
        character = PersonalizationCharactersManager._get_authorized_character(character_id, parent_id)

        updatable_fields = ["name", "gender", "colors", "parts", "customizable"]
        for field in updatable_fields:
            if field in data:
                setattr(character, field, data[field])

        db.session.commit()
        return character.to_dict()

    @staticmethod
    def delete_personalization_character(character_id, parent_id):
        character = PersonalizationCharactersManager._get_authorized_character(character_id, parent_id)

        db.session.delete(character)
        db.session.commit()
        return True

    @staticmethod
    def reset_character(character_id, parent_id):
        character = PersonalizationCharactersManager._get_authorized_character(character_id, parent_id)

        template = character.template
        character.role = template.role
        character.name = template.name
        character.gender = template.gender
        character.colors = template.colors.copy()
        character.parts = template.parts.copy() if template.parts else None
        character.customizable = template.customizable

        db.session.commit()
        return character.to_dict()