
# About

I wrote this because I didn't like having to remember the build command for
every source file I wrote. Then I kind of made it into a Sublime plugin to beat 
all Sublime plugins. ...and then into an entire command-line tool.

# Usage

There's, like, 4 ways of using this tool.

### Like a shebang line

You know how your python scripts already have two copy/pasted lines at the start of each script that go like `#!/usr/bin/python` and `# -*- encoding: utf-8 -*-`? Well, why not add another one! The third (or second) line can now be used as a command prefix! Prepend some amount of non-whitespace characters to mark it off as a comment and this script will cut it right off. An example Python script would look like that one down there:

``` python
#!/usr/bin/python3
# -*- encoding: utf-8
# weird-python-compiler pythonfile.py -o out.html
```

### Command prefix

You can also manually say what kind of prefix the command has, so the script will find the line for you. Once it's found the prefix is snipped from the start and the results run via `system`.

``` ruby
rx = /^\s*#{options[:prefix]}\s*/
command = f.each_line.detect do |line|
  rx.match line
end
abort "No line with that prefix!" unless command
command.gsub!(rx, '')
```

That's all it takes to implement! You can put it to good use with a comment like

``` c
//# gcc -o test test.c
```

... coupled with the command

``` bash
ruby inmake.rb -f test.c -p "//#"
```

### Command suffix (postfix)

You can also specify a postfix that you can append to the end of the line, also searched for and snipped like the prefix. 

In this case however, the program also walks right until the first whitespace character to cut off any comment characters you might've stashed there. Useful to leave impromptuwhitespacelessnotes.

``` ruby
rx = /#{opts[:postfix]}\s*$/
command = f.each_line.detect do |line|
  rx.match line
end
abort "No line with that postfix!" unless command
command.gsub!(rx, '')
command = command[(command =~ /\s/)...command.length].strip
```

This also looks simple, because it is. You can employ it with comments such as 

``` c
//remembertogetsomemilkfromthestore gcc -o test test.c moo
``` 

... eternally bound to the command

``` bash
ruby inmake.rb -f test.c -m moo
```

### Regexing

For the extremely brave and the unwieldily apt, there's also a way to specify your own regular expression! It's got to be of a flavor Ruby supports, which means it's 99% certainly Perl-compatible regex. Also, skip the surrounding slashes, we've got enough of them inside the code anyway. Thing is, there's no way *yet* to set any flags for the regex, so you'll get none.

``` ruby
rx = opts[:regex]
command = f.each_line.detect do |line|
rx.match line
end
abort "Regex didn't match any lines!" unless command
command = command[(command =~ /\s/)...command.length].strip
command.gsub!(rx, '') if opts[:sm]
``` 

Okay so as you see there's a regex option, but what's that `:sm` option? 
That's to tell the script to cut your newly-matched snippets off as well as finding them. You can set that flag on the command line with the `--strip-matched` option.

Use regexes with any type of comment you can match to (for example:

``` c
// g~c~c -~o t~e~s~t t~e~s~t~.~c -DAWESOME=~1
``` 

) and matching with: 

``` bash
ruby inmake.rb -f test.c -r "~" --strip-matched
``` 

The stripping will always substitute every match on the line, since `String#gsub!` is used for the process.

<a name="sublime"></a>
# Sublime Text build script

This tool is an awesome companion to your text editor. I use Sublime Text, so 
I've also included the build script I use here. Make sure to replace $LOCATION
with where your script resides in.

``` json
{
  "shell_cmd": "ruby $LOCATION/inmake.rb -f \"$file\""
}
``` 

# Source code

The source code will always just be accessible [here][gist]. 

[gist]: https://gist.github.com/boxmein/8303778


# Examples

The simplest way to use inmake is to not specify any other flags and let it use
line 2 of the source code as your shell command. For example, 

``` c
// A simple hello-world script.
// gcc -o test test.c -DAWESOME=1
// (ruby inmake.rb -f test.c)
#include <stdio.h>
int main() {
    printf("Hello world!\n");

    if (AWESOME){
        printf("awesome!\n");
    }
}
```

You can use the post-fix mode like this:

``` c
// gcc -o test test.c -DAWESOME=1 thisisapostfix
// (ruby inmake.rb -f test.c -m 'thisisapostfix')
#include <stdio.h>
int main() {
    printf("Hello world!\n");

    if (AWESOME){
        printf("awesome!\n");
    }
}
``` 

And you can use the regex mode like this: 

``` c
// !!!!! gcc -o test test.c -DAWESOME=1 !!!!!
// (ruby inmake.rb -f test.c -r '^!!!!!|!!!!!$' --strip-matched)
int main() {
    printf("Hello world!\n");
    if (AWESOME){
        printf("awesome!\n");
    }
}
```

..This pretty much covers examples.

