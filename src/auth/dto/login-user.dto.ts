import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from "class-validator";


export class LoginUserDto {


    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

}
