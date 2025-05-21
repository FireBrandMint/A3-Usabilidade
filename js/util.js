
export function foreachHtmlWithClass (event, class_name, callback)
{
    var elements = document.getElementsByClassName(class_name);
    for(var i = 0; i < elements.length; ++i)
    {
        callback(elements[i]);
    }

    event.returnValue = 'success';
}