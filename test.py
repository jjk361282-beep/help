from enum import Enum

class UserRole(str, Enum):
    EMPLOYE = "employe"
    TECHNICIEN = "technicien"
    ADMIN = "admin"

class UserBase():
    role:UserRole

# role=UserRole()

user=UserBase()
user.role=UserRole.EMPLOYE

print( user.role==UserRole.ADMIN)

